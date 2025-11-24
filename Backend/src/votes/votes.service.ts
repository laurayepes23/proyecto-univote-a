// src/votes/votes.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVoteDto } from "./dto/create-vote.dto";

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async createVote(createVoteDto: CreateVoteDto) {
    const { voterId, candidateId, electionId } = createVoteDto;

    console.log("🗳️ Intentando registrar voto:", {
      voterId,
      candidateId,
      electionId,
    });

    // Verificar que la elección existe y está activa
    const election = await this.prisma.election.findUnique({
      where: { id_election: electionId },
    });

    if (!election) {
      throw new NotFoundException("Elección no encontrada");
    }

    if (election.estado_election !== "Activa") {
      throw new BadRequestException("La elección no está activa");
    }

    // Verificar que el votante existe
    const voter = await this.prisma.voter.findUnique({
      where: { id_voter: voterId },
    });

    if (!voter) {
      throw new NotFoundException("Votante no encontrado");
    }

    if (voter.estado_voter !== "Activo") {
      throw new BadRequestException("El votante no está activo");
    }

    // Verificar que el candidato existe y pertenece a la elección
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id_candidate: candidateId,
        electionId: electionId,
      },
    });

    if (!candidate) {
      throw new NotFoundException(
        "Candidato no encontrado o no pertenece a esta elección",
      );
    }

    // Verificar si el votante ya ha votado en esta elección
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        voterId: voterId,
        electionId: electionId,
      },
    });

    if (existingVote) {
      throw new ConflictException(
        "Este votante ya emitió su voto en esta elección.",
      );
    }

    try {
      // Usar una transacción para asegurar que ambas operaciones se completen
      const result = await this.prisma.$transaction(async (prisma: any) => {
        // 1. Actualizar el voter con la elección en la que votó
        const updatedVoter = await prisma.voter.update({
          where: { id_voter: voterId },
          data: {
            electionId: electionId, // ✅ ESTA ES LA PARTE CLAVE QUE FALTABA
          },
          select: {
            id_voter: true,
            nombre_voter: true,
            apellido_voter: true,
            electionId: true,
          },
        });

        // 2. Crear el voto
        const vote = await prisma.vote.create({
          data: {
            fecha_vote: new Date(),
            hora_vote: new Date(),
            voterId: voterId,
            candidateId: candidateId,
            electionId: electionId,
          },
          include: {
            voter: {
              select: {
                id_voter: true,
                nombre_voter: true,
                apellido_voter: true,
                electionId: true, // Incluir el electionId actualizado
              },
            },
            candidate: {
              select: {
                id_candidate: true,
                nombre_candidate: true,
                apellido_candidate: true,
              },
            },
            election: {
              select: {
                id_election: true,
                nombre_election: true,
              },
            },
          },
        });

        return {
          updatedVoter,
          vote,
        };
      });

      console.log(
        "✅ Voto registrado y votante actualizado exitosamente:",
        result,
      );
      return {
        success: true,
        message: "Voto registrado correctamente",
        data: {
          vote: result.vote,
          voterUpdated: result.updatedVoter,
        },
      };
    } catch (error) {
      console.error("❌ Error al crear voto:", error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw new BadRequestException("Error al registrar el voto: " + message);
    }
  }

  async getVotes() {
    return this.prisma.vote.findMany({
      include: {
        voter: {
          select: {
            id_voter: true,
            nombre_voter: true,
            apellido_voter: true,
            electionId: true, // Incluir electionId del voter
          },
        },
        candidate: {
          select: {
            id_candidate: true,
            nombre_candidate: true,
            apellido_candidate: true,
          },
        },
        election: {
          select: {
            id_election: true,
            nombre_election: true,
          },
        },
      },
      orderBy: {
        fecha_vote: "desc",
      },
    });
  }

  // Método adicional para verificar estado de voto
  async checkVoteStatus(voterId: number, electionId: number) {
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        voterId: voterId,
        electionId: electionId,
      },
      select: {
        id_vote: true,
        fecha_vote: true,
        candidate: {
          select: {
            nombre_candidate: true,
            apellido_candidate: true,
          },
        },
      },
    });

    // También verificar si el voter ya tiene asignada esta elección
    const voter = await this.prisma.voter.findUnique({
      where: { id_voter: voterId },
      select: { electionId: true },
    });

    return {
      hasVoted: !!existingVote,
      electionAssigned: voter?.electionId === electionId,
      vote: existingVote,
      voterElection: voter?.electionId,
    };
  }
}
