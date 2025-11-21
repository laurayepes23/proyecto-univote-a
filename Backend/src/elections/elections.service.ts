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

  async create(createElectionDto: CreateElectionDto) {
    const { id_admin, ...electionData } = createElectionDto;

    return this.prisma.election.create({
      data: {
        ...electionData, 
        administrador: {
          connect: {
            id_admin: id_admin, 
          },
        },
      },
      include: {
        administrador: true,
        candidates: true,
        voters: true,
        result: true
      }
    });
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
      fecha_inicio: election.fecha_inicio.toLocaleString('es-ES', { 
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      fecha_fin: election.fecha_fin.toLocaleString('es-ES', { 
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
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
        fecha_inicio: election.fecha_inicio.toLocaleString('es-ES', { 
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        fecha_fin: election.fecha_fin.toLocaleString('es-ES', { 
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
      };
    }

    return null;
  }

  async update(id: number, updateElectionDto: UpdateElectionDto) {
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

  // NUEVO: Validar si una elección puede iniciarse
  async canStartElection(id: number): Promise<{ canStart: boolean; message?: string }> {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        candidates: {
          include: {
            role: true,
          }
        },
      },
    });

    if (!election) {
      throw new BadRequestException('Elección no encontrada');
    }

    // Verificar que hay al menos un candidato (excluyendo Voto en Blanco)
    const realCandidates = election.candidates.filter(
      candidate => candidate.nombre_candidate !== 'Voto en Blanco'
    );

    if (realCandidates.length === 0) {
      return { 
        canStart: false, 
        message: 'No se puede iniciar la elección. Debe haber al menos un candidato registrado (excluyendo Voto en Blanco).' 
      };
    }

    return { canStart: true };
  }

  // NUEVO: Generar un número de documento único para Voto en Blanco
  async generateUniqueDocumentNumber(): Promise<bigint> {
    // Buscar el número de documento más alto en la base de datos
    const highestDoc = await this.prisma.candidate.findFirst({
      orderBy: {
        num_doc_candidate: 'desc',
      },
      select: {
        num_doc_candidate: true,
      },
    });

    if (highestDoc) {
      // Usar el siguiente número disponible
      return highestDoc.num_doc_candidate + 1n;
    } else {
      // Si no hay candidatos, empezar desde un número alto
      return 9999999999n;
    }
  }

  // NUEVO: Agregar voto en blanco automáticamente
  async addBlankVoteToElection(id: number) {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        candidates: true,
      },
    });

    if (!election) {
      throw new BadRequestException('Elección no encontrada');
    }

    // Verificar si ya existe el voto en blanco
    const blankVoteExists = election.candidates.some(
      candidate => candidate.nombre_candidate === 'Voto en Blanco'
    );

    if (!blankVoteExists) {
      // Buscar el rol por defecto para candidatos
      const defaultRole = await this.prisma.role.findFirst({
        where: {
          nombre_role: {
            contains: 'candidato',
            mode: 'insensitive'
          }
        }
      });

      if (!defaultRole) {
        throw new BadRequestException('No se encontró un rol adecuado para el Voto en Blanco');
      }

      // Buscar una carrera por defecto
      const defaultCareer = await this.prisma.career.findFirst();

      if (!defaultCareer) {
        throw new BadRequestException('No se encontró ninguna carrera en el sistema');
      }

      // Generar un número de documento único
      const uniqueDocNumber = await this.generateUniqueDocumentNumber();

      // Crear el candidato "Voto en Blanco"
      return this.prisma.candidate.create({
        data: {
          nombre_candidate: 'Voto en Blanco',
          apellido_candidate: 'Sistema',
          tipo_doc_candidate: 'N/A',
          num_doc_candidate: uniqueDocNumber,
          correo_candidate: `voto.en.blanco.${id}@sistema.com`,
          estado_candidate: 'Activo',
          foto_candidate: null,
          contrasena_candidate: 'no_password',
          role: {
            connect: {
              id_role: defaultRole.id_role
            }
          },
          career: {
            connect: {
              id_career: defaultCareer.id_career
            }
          },
          election: {
            connect: {
              id_election: id,
            },
          },
        },
      });
    }

    return null;
  }

  async updateStatus(id: number, status: string) {
    // Si se está iniciando la elección, validar y agregar voto en blanco
    if (status === 'Activa') {
      const validation = await this.canStartElection(id);
      if (!validation.canStart) {
        throw new BadRequestException(validation.message);
      }

      // Agregar voto en blanco automáticamente
      await this.addBlankVoteToElection(id);
    }

    return this.prisma.election.update({
      where: { id_election: id },
      data: { estado_election: status },
      include: {
        candidates: true,
        administrador: true
      }
    });
  }

  // NUEVO: Método para obtener estadísticas de la elección - CORREGIDO
  async getElectionStats(id: number) {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        candidates: true, // Traer TODOS los candidatos sin filtrar
        voters: true,
      }
    });

    if (!election) {
      throw new BadRequestException('Elección no encontrada');
    }

    // Contar votos usando Prisma count
    const totalVotes = await this.prisma.vote.count({
      where: {
        electionId: id
      }
    });

    const totalVoters = await this.prisma.voter.count({
      where: {
        electionId: id
      }
    });

    // Filtrar candidatos reales (excluyendo Voto en Blanco) después de obtenerlos
    const realCandidates = election.candidates.filter(
      candidate => candidate.nombre_candidate !== 'Voto en Blanco'
    );

    // Verificar si existe voto en blanco
    const hasBlankVote = election.candidates.some(
      candidate => candidate.nombre_candidate === 'Voto en Blanco'
    );

    return {
      totalCandidates: realCandidates.length, // Solo contar candidatos reales
      totalVoters: totalVoters,
      totalVotes: totalVotes,
      hasBlankVote: hasBlankVote,
      canStart: realCandidates.length >= 1
    };
  }

  // Método alternativo más simple para verificar candidatos
  async getElectionCandidatesCount(id: number): Promise<number> {
    const candidates = await this.prisma.candidate.findMany({
      where: {
        electionId: id,
        NOT: {
          nombre_candidate: 'Voto en Blanco'
        }
      }
    });

    return candidates.length;
  }

  // Método simplificado para verificar si puede iniciar
  async canStartSimple(id: number): Promise<{ canStart: boolean; message?: string }> {
    try {
      const candidateCount = await this.getElectionCandidatesCount(id);
      
      if (candidateCount === 0) {
        return {
          canStart: false,
          message: 'No se puede iniciar la elección. Debe haber al menos un candidato registrado.'
        };
      }

      return { canStart: true };
    } catch (error) {
      return {
        canStart: false,
        message: 'Error al verificar la elección.'
      };
    }
  }

  // NUEVO: Método específico para obtener conteo de candidatos para frontend
  async getElectionsWithCandidateCount() {
    const elections = await this.prisma.election.findMany({
      include: {
        administrador: true,
        candidates: true,
        voters: true,
        result: true
      }
    });

    // Para cada elección, contar candidatos reales
    const electionsWithCounts = await Promise.all(
      elections.map(async (election) => {
        const realCandidatesCount = await this.prisma.candidate.count({
          where: {
            electionId: election.id_election,
            NOT: {
              nombre_candidate: 'Voto en Blanco'
            }
          }
        });

        return {
          ...election,
          fecha_inicio: election.fecha_inicio.toLocaleString('es-ES', { 
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          fecha_fin: election.fecha_fin.toLocaleString('es-ES', { 
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          realCandidatesCount: realCandidatesCount
        };
      })
    );

    return electionsWithCounts;
  }
}