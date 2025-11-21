// proposals.service.ts - ACTUALIZADO
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(createProposalDto: CreateProposalDto) {
    // Verificar que el candidato existe y está aprobado
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: createProposalDto.candidateId },
      include: {
        election: true
      }
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    // Verificar que el candidato esté aprobado y tenga una elección asignada
    if (candidate.estado_candidate !== 'Aprobado') {
      throw new BadRequestException('Solo los candidatos aprobados pueden crear propuestas');
    }

    if (!candidate.electionId) {
      throw new BadRequestException('El candidato no está asignado a ninguna elección');
    }

    return this.prisma.proposal.create({
      data: {
        titulo_proposal: createProposalDto.titulo_proposal,
        descripcion_proposal: createProposalDto.descripcion_proposal,
        estado_proposal: createProposalDto.estado_proposal || 'Activa',
        candidateId: createProposalDto.candidateId,
        electionId: candidate.electionId
      },
      include: {
        candidate: {
          include: {
            election: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.proposal.findMany({
      include: {
        candidate: {
          include: {
            election: true
          }
        }
      }
    });
  }

  // NUEVO MÉTODO: Propuestas públicas por elección (sin validación de votante)
  async findAllPublicByElection(electionId: number) {
    return this.prisma.proposal.findMany({
      where: {
        estado_proposal: 'Activa',
        electionId: electionId,
        candidate: {
          estado_candidate: 'Aprobado'
        }
      },
      include: {
        candidate: {
          include: {
            career: true,
            election: true
          }
        }
      },
      orderBy: {
        candidate: {
          nombre_candidate: 'asc'
        }
      }
    });
  }

  // NUEVO MÉTODO: Obtener todas las elecciones activas con propuestas
  async getActiveElectionsWithProposals() {
    const elections = await this.prisma.election.findMany({
      where: {
        estado_election: 'Activa'
      },
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

    // Filtrar elecciones que tengan al menos un candidato con propuestas
    return elections.filter(election => 
      election.candidates.some(candidate => candidate.proposals.length > 0)
    );
  }

  async findAllPublic() {
    return this.prisma.proposal.findMany({
      where: {
        estado_proposal: 'Activa',
        candidate: {
          estado_candidate: 'Aprobado'
        }
      },
      include: {
        candidate: {
          include: {
            election: true
          }
        }
      }
    });
  }

  async findAllByOwner(candidateId: number) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    return this.prisma.proposal.findMany({
      where: {
        candidateId: candidateId
      },
      include: {
        candidate: {
          include: {
            election: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id_proposal: id },
      include: {
        candidate: {
          include: {
            election: true
          }
        }
      }
    });

    if (!proposal) {
      throw new NotFoundException(`Propuesta con ID ${id} no encontrada`);
    }

    return proposal;
  }

  async update(id: number, updateProposalDto: UpdateProposalDto) {
    try {
      return await this.prisma.proposal.update({
        where: { id_proposal: id },
        data: updateProposalDto,
        include: {
          candidate: {
            include: {
              election: true
            }
          }
        }
      });
    } catch (error) {
      throw new NotFoundException(`Propuesta con ID ${id} no encontrada`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.proposal.delete({
        where: { id_proposal: id }
      });
      
      return {
        success: true,
        message: `Propuesta con ID ${id} eliminada correctamente`
      };
    } catch (error) {
      throw new NotFoundException(`Propuesta con ID ${id} no encontrada`);
    }
  }

  // MÉTODO AUXILIAR: Obtener propuestas por elección
  async getProposalsByElection(electionId: number) {
    return this.prisma.proposal.findMany({
      where: {
        electionId: electionId,
        estado_proposal: 'Activa',
        candidate: {
          estado_candidate: 'Aprobado'
        }
      },
      include: {
        candidate: {
          include: {
            career: true
          }
        }
      }
    });
  }
}