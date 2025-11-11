import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';

@Injectable()
export class ElectionsService {
  constructor(private prisma: PrismaService) { }

  // --- MÉTODO DE RESULTADOS ---
  async getResults() {
    const elections = await this.prisma.election.findMany({
      include: {
        candidates: true,
      },
    });

    const results = await Promise.all(
      elections.map(async (election) => {
        const candidatesWithVotes = await Promise.all(
          election.candidates.map(async (candidate) => {
            // Conteo los votos para cada candidato
            const voteCount = await this.prisma.vote.count({
              where: {
                candidateId: candidate.id_candidate,
              },
            });
            return { ...candidate, votos: voteCount };
          }),
        );
        return { ...election, candidates: candidatesWithVotes };
      }),
    );

    return results;
  }

  async create(createElectionDto: CreateElectionDto, user: any) {
    // Validaciones de negocio adicionales para evitar errores 500 silenciosos.
    const { fecha_inicio, fecha_fin } = createElectionDto;

    if (fecha_fin <= fecha_inicio) {
      throw new BadRequestException('fecha_fin debe ser posterior a fecha_inicio');
    }

    const estado = createElectionDto.estado_election?.trim() || 'Programada';

    // Derivamos el administrador del usuario autenticado.
    const adminId = parseInt(user.id, 10);
    if (isNaN(adminId)) {
      throw new BadRequestException('Administrador inválido en el contexto de autenticación');
    }

    try {
      return await this.prisma.election.create({
        data: {
          nombre_election: createElectionDto.nombre_election,
          fecha_inicio: createElectionDto.fecha_inicio,
          fecha_fin: createElectionDto.fecha_fin,
          estado_election: estado,
          administrador: {
            connect: { id_admin: adminId },
          },
        },
        include: {
          administrador: true,
          candidates: true,
          voters: true,
          result: true,
        },
      });
    } catch (error: any) {
      // Prisma lanza errores de integridad (FK) o validación que convertimos a 400/422 explícitos si es posible.
      if (error.code === 'P2003') {
        throw new BadRequestException('No se pudo asociar la elección al administrador (FK inválida)');
      }
      throw error; // Se propagará y Nest lo convertirá a 500 con mensaje genérico si es desconocido.
    }
  }

  async findAll() {
    const elections = await this.prisma.election.findMany({
      include: {
        administrador: true,
        candidates: true,
        voters: true,
        result: true
      }
    });

    return elections.map(election => ({
      ...election,
      fecha_inicio: election.fecha_inicio.toLocaleDateString('es-ES', { timeZone: 'UTC' }),
      fecha_fin: election.fecha_fin.toLocaleDateString('es-ES', { timeZone: 'UTC' }),
    }));
  }

  async findOne(id: number) {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        administrador: true,
        candidates: {
          include: {
            proposals: true,
          },
        },
        voters: true,
        result: true
      }
    });

    if (election) {
      return {
        ...election,
        fecha_inicio: election.fecha_inicio.toLocaleDateString('es-ES', { timeZone: 'UTC' }),
        fecha_fin: election.fecha_fin.toLocaleDateString('es-ES', { timeZone: 'UTC' }),
      };
    }

    return null;
  }

  async update(id: number, updateElectionDto: UpdateElectionDto) {
    // Nota: Si tu UpdateElectionDto también incluye 'id_admin',
    // necesitarás aplicar una lógica similar a la del método 'create'.
    return this.prisma.election.update({
      where: { id_election: id },
      data: updateElectionDto,
      include: {
        administrador: true,
        candidates: true,
        voters: true,
        result: true
      }
    });
  }

  async remove(id: number) {
    return this.prisma.election.delete({
      where: { id_election: id }
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.election.update({
      where: { id_election: id },
      data: { estado_election: status }
    });
  }
}