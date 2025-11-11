// src/votes/votes.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VotesService {
    constructor(private prisma: PrismaService) { }

    async createVote(createVoteDto: Omit<CreateVoteDto, 'voterId'> & { voterId: number }) {
        const { voterId, candidateId, electionId } = createVoteDto;

        // Verificar que el votante existe
        const voter = await this.prisma.voter.findUnique({ where: { id_voter: voterId } });
        if (!voter) {
            throw new NotFoundException('Votante no encontrado');
        }

        // Verificar que el candidato existe
        const candidate = await this.prisma.candidate.findUnique({
            where: { id_candidate: candidateId },
            select: { id_candidate: true, electionId: true }
        });
        if (!candidate) {
            throw new NotFoundException('Candidato no encontrado');
        }

        // Verificar que la elección existe
        const election = await this.prisma.election.findUnique({
            where: { id_election: electionId },
            select: { id_election: true }
        });
        if (!election) {
            throw new NotFoundException('Elección no encontrada');
        }

        // Validar asociación candidato ↔ elección
        if (candidate.electionId !== electionId) {
            throw new NotFoundException('El candidato no está asociado a la elección indicada');
        }

        // Verificar si el votante ya ha votado en esta elección
        const existingVote = await this.prisma.vote.findFirst({
            where: {
                voter: { id_voter: voterId },
                election: { id_election: electionId }
            }
        });

        if (existingVote) {
            throw new ConflictException('Este votante ya emitió su voto en esta elección.');
        }

        // Crear el voto
        return this.prisma.vote.create({
            data: {
                fecha_vote: new Date(),
                hora_vote: new Date(),
                voter: { connect: { id_voter: voterId } },
                candidate: { connect: { id_candidate: candidateId } },
                election: { connect: { id_election: electionId } }
            },
            include: {
                voter: true,
                candidate: true,
                election: true
            }
        });
    }

    async getVotes() {
        return this.prisma.vote.findMany({
            include: {
                voter: true,
                candidate: true
            }
        });
    }

    async hasUserVoted(voterId: number, electionId: number): Promise<boolean> {
        const existingVote = await this.prisma.vote.findFirst({
            where: {
                voter: { id_voter: voterId },
                election: { id_election: electionId }
            }
        });

        return !!existingVote;
    }
}