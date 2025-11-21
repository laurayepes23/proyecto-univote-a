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
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          },
        },
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
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
        voters: true,
        result: true
      }
    });
  }

  async findAll() {
    const elections = await this.prisma.election.findMany({
      include: {
        administrador: true,
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
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
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            },
            career: true
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

  // NUEVO: Método específico para obtener elección con propuestas para votantes
  async findOneWithProposalsForVoter(id: number) {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        administrador: true,
        candidates: {
          where: {
            estado_candidate: 'Aprobado' // Solo candidatos aprobados
          },
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa' // Solo propuestas activas
              }
            },
            career: true
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
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
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

  // NUEVO: Validar si una elección puede iniciarse - CORREGIDO
  async canStartElection(id: number): Promise<{ canStart: boolean; message?: string }> {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        candidates: {
          where: {
            estado_candidate: 'Aprobado', // Solo candidatos aprobados
          },
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
      },
    });

    if (!election) {
      throw new BadRequestException('Elección no encontrada');
    }

    // Verificar que hay al menos un candidato aprobado
    const approvedCandidates = election.candidates.filter(
      candidate => candidate.estado_candidate === 'Aprobado'
    );

    if (approvedCandidates.length === 0) {
      return { 
        canStart: false, 
        message: 'No se puede iniciar la elección. Debe haber al menos un candidato aprobado registrado.' 
      };
    }

    // Verificar que los candidatos aprobados tengan al menos una propuesta activa
    const candidatesWithProposals = approvedCandidates.filter(
      candidate => candidate.proposals.length > 0
    );

    if (candidatesWithProposals.length === 0) {
      return { 
        canStart: false, 
        message: 'No se puede iniciar la elección. Los candidatos aprobados deben tener al menos una propuesta activa.' 
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

    // Verificar si ya existe el voto en blanco (por nombre)
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
          estado_candidate: 'Aprobado', // Voto en Blanco siempre está aprobado
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
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
        administrador: true
      }
    });
  }

  // NUEVO: Método para obtener estadísticas de la elección - CORREGIDO
  async getElectionStats(id: number) {
    const election = await this.prisma.election.findUnique({
      where: { id_election: id },
      include: {
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
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

    // Filtrar candidatos reales aprobados (excluyendo Voto en Blanco) después de obtenerlos
    const approvedCandidates = election.candidates.filter(
      candidate => candidate.nombre_candidate !== 'Voto en Blanco' && candidate.estado_candidate === 'Aprobado'
    );

    // Contar candidatos con propuestas activas
    const candidatesWithProposals = approvedCandidates.filter(
      candidate => candidate.proposals.length > 0
    );

    // Verificar si existe voto en blanco
    const hasBlankVote = election.candidates.some(
      candidate => candidate.nombre_candidate === 'Voto en Blanco'
    );

    return {
      totalCandidates: approvedCandidates.length, // Solo contar candidatos aprobados reales
      candidatesWithProposals: candidatesWithProposals.length, // Candidatos con propuestas
      totalVoters: totalVoters,
      totalVotes: totalVotes,
      hasBlankVote: hasBlankVote,
      canStart: approvedCandidates.length >= 1 && candidatesWithProposals.length >= 1
    };
  }

  // Método alternativo más simple para verificar candidatos - CORREGIDO
  async getElectionCandidatesCount(id: number): Promise<number> {
    const candidates = await this.prisma.candidate.findMany({
      where: {
        electionId: id,
        estado_candidate: 'Aprobado', // Solo candidatos aprobados
      },
      include: {
        proposals: {
          where: {
            estado_proposal: 'Activa'
          }
        }
      }
    });

    // Solo contar candidatos que tengan al menos una propuesta activa
    return candidates.filter(candidate => candidate.proposals.length > 0).length;
  }

  // Método simplificado para verificar si puede iniciar - CORREGIDO
  async canStartSimple(id: number): Promise<{ canStart: boolean; message?: string }> {
    try {
      const candidateCount = await this.getElectionCandidatesCount(id);
      
      if (candidateCount === 0) {
        return {
          canStart: false,
          message: 'No se puede iniciar la elección. Debe haber al menos un candidato aprobado con propuestas activas registrado.'
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

  // NUEVO: Método específico para obtener conteo de candidatos para frontend - CORREGIDO
  async getElectionsWithCandidateCount() {
    const elections = await this.prisma.election.findMany({
      include: {
        administrador: true,
        candidates: {
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            }
          }
        },
        voters: true,
        result: true
      }
    });

    // Para cada elección, contar candidatos aprobados con propuestas
    const electionsWithCounts = await Promise.all(
      elections.map(async (election) => {
        // CONTAR TODOS LOS CANDIDATOS APROBADOS (sin filtrar por es_blanco)
        const approvedCandidatesWithProposals = await this.prisma.candidate.count({
          where: {
            electionId: election.id_election,
            estado_candidate: 'Aprobado',
            proposals: {
              some: {
                estado_proposal: 'Activa'
              }
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
          // Usar el nombre que espera el frontend
          realCandidatesCount: approvedCandidatesWithProposals
        };
      })
    );

    return electionsWithCounts;
  }

  // NUEVO: Método para obtener propuestas de una elección específica
  async getElectionProposals(electionId: number) {
    const election = await this.prisma.election.findUnique({
      where: { id_election: electionId },
      include: {
        candidates: {
          where: {
            estado_candidate: 'Aprobado'
          },
          include: {
            proposals: {
              where: {
                estado_proposal: 'Activa'
              }
            },
            career: true
          }
        }
      }
    });

    if (!election) {
      throw new BadRequestException('Elección no encontrada');
    }

    // Extraer y aplanar todas las propuestas de los candidatos
    const allProposals = election.candidates.flatMap(candidate => 
      candidate.proposals.map(proposal => ({
        ...proposal,
        candidate: {
          id_candidate: candidate.id_candidate,
          nombre_candidate: candidate.nombre_candidate,
          apellido_candidate: candidate.apellido_candidate,
          foto_candidate: candidate.foto_candidate,
          career: candidate.career
        }
      }))
    );

    return {
      election: {
        id_election: election.id_election,
        nombre_election: election.nombre_election,
        estado_election: election.estado_election
      },
      proposals: allProposals
    };
  }

  // NUEVO: Método de debug para verificar candidatos
  async debugCandidatesCount(id: number) {
    const totalCandidates = await this.prisma.candidate.count({
      where: {
        electionId: id
      }
    });

    const approvedCandidates = await this.prisma.candidate.count({
      where: {
        electionId: id,
        estado_candidate: 'Aprobado'
      }
    });

    const candidatesWithProposals = await this.prisma.candidate.count({
      where: {
        electionId: id,
        estado_candidate: 'Aprobado',
        proposals: {
          some: {
            estado_proposal: 'Activa'
          }
        }
      }
    });

    return {
      electionId: id,
      totalCandidates,
      approvedCandidates,
      candidatesWithProposals
    };
  }
}