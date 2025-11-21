import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ImageProcessorService } from "./image-processor.service";
import { NotificationsService } from "../notications/notifications.service";
import * as bcrypt from "bcrypt";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { LoginCandidateDto } from "./dto/login-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { ApplyToElectionDto } from "./dto/apply-to-election.dto";

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private imageProcessor: ImageProcessorService,
    private notificationsService: NotificationsService
  ) {}

  async findOne(id: number) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: id },
      include: {
        election: {
          select: {
            id_election: true,
            nombre_election: true,
            fecha_inicio: true,
            fecha_fin: true,
            estado_election: true,
          },
        },
        career: {
          select: {
            id_career: true,
            nombre_career: true,
            facultad_career: true,
          },
        },
        role: {
          select: {
            id_role: true,
            nombre_role: true,
          },
        },
        proposals: {
          select: {
            id_proposal: true,
            titulo_proposal: true,
            descripcion_proposal: true,
            estado_proposal: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado.`);
    }

    const { contrasena_candidate, ...result } = candidate;
    return {
      ...result,
      num_doc_candidate: result.num_doc_candidate.toString(),
    };
  }

  async applyToElection(applyToElectionDto: ApplyToElectionDto) {
    const { candidateId, electionId } = applyToElectionDto;

    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(
        `El candidato con ID ${candidateId} no fue encontrado.`
      );
    }

    if (candidate.electionId) {
      throw new ConflictException(
        "Ya estás postulado a una elección. No puedes postularte a más de una."
      );
    }

    const election = await this.prisma.election.findUnique({
      where: { id_election: electionId },
    });

    if (!election) {
      throw new NotFoundException(
        `La elección con ID ${electionId} no fue encontrada.`
      );
    }

    if (election.estado_election !== "Programada") {
      throw new BadRequestException(
        "Solo puedes postularte a elecciones programadas"
      );
    }

    try {
      const updatedCandidate = await this.prisma.candidate.update({
        where: { id_candidate: candidateId },
        data: {
          election: { connect: { id_election: electionId } },
          estado_candidate: "Pendiente",
        },
        include: {
          election: {
            select: {
              id_election: true,
              nombre_election: true,
              estado_election: true,
            },
          },
        },
      });

      const { contrasena_candidate, ...result } = updatedCandidate;
      return {
        message:
          "Postulación exitosa. Tu solicitud está pendiente de aprobación.",
        candidate: result,
      };
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException("Candidato o elección no encontrada");
      }
      throw new BadRequestException(
        "No se pudo completar la postulación: " + error.message
      );
    }
  }

  async findAll() {
    const candidates = await this.prisma.candidate.findMany({
      include: {
        election: {
          select: {
            id_election: true,
            nombre_election: true,
            estado_election: true,
          },
        },
        career: {
          select: {
            nombre_career: true,
            facultad_career: true,
          },
        },
        proposals: {
          select: {
            id_proposal: true,
            titulo_proposal: true,
            estado_proposal: true,
          },
        },
      },
    });
    return candidates.map((c) => ({
      ...c,
      num_doc_candidate: c.num_doc_candidate.toString(),
    }));
  }

  async findOneWithProposals(id: number) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: id },
      include: {
        proposals: true,
        career: {
          select: {
            nombre_career: true,
            facultad_career: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado.`);
    }

    const { contrasena_candidate, ...result } = candidate;
    return result;
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    try {
      if (updateCandidateDto.contrasena_candidate) {
        updateCandidateDto.contrasena_candidate = await bcrypt.hash(
          updateCandidateDto.contrasena_candidate,
          10
        );
      }

      const updatedCandidate = await this.prisma.candidate.update({
        where: { id_candidate: id },
        data: updateCandidateDto,
      });
      const { contrasena_candidate, ...result } = updatedCandidate;
      return result;
    } catch (error) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado.`);
    }
  }

  async validatePassword(candidateId: number, password: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException("Candidato no encontrado");
    }

    const isValid = await bcrypt.compare(
      password,
      candidate.contrasena_candidate
    );
    return { valid: isValid };
  }

  async withdrawFromElection(
    candidateId: number,
    nuevoEstado: string = "Inactivo"
  ) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException("Candidato no encontrado");
    }

    if (!candidate.electionId && nuevoEstado === "Inactivo") {
      throw new BadRequestException(
        "El candidato no está postulado a ninguna elección"
      );
    }

    try {
      const updateData: any = {
        estado_candidate: nuevoEstado,
      };

      if (candidate.electionId) {
        updateData.electionId = null;
      }

      const updatedCandidate = await this.prisma.candidate.update({
        where: { id_candidate: candidateId },
        data: updateData,
      });

      const { contrasena_candidate, ...result } = updatedCandidate;
      return {
        message:
          nuevoEstado === "No Aprobado"
            ? "Candidato rechazado correctamente"
            : "Te has retirado exitosamente de la elección",
        candidate: result,
      };
    } catch (error) {
      throw new BadRequestException(
        "Error al actualizar el candidato: " + error.message
      );
    }
  }

  async approveCandidate(id_candidate: number) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate },
    });

    if (!candidate) {
      throw new NotFoundException(
        `Candidato con ID ${id_candidate} no encontrado.`
      );
    }

    const updatedCandidate = await this.prisma.candidate.update({
      where: { id_candidate },
      data: { estado_candidate: "Aprobado" },
      include: {
        election: {
          select: {
            id_election: true,
            nombre_election: true,
            estado_election: true,
          },
        },
      },
    });

    // Crear notificación de aprobación
    await this.notificationsService.create({
      id_candidate,
      titulo: "🎉 Postulación Aprobada",
      mensaje: `¡Felicidades ${candidate.nombre_candidate}! Tu postulación ha sido aprobada. Ya eres un candidato oficial para la elección.`,
      tipo: "aprobacion",
    });

    const { contrasena_candidate, ...result } = updatedCandidate;
    return result;
  }

  async rejectCandidate(id_candidate: number, motivo_rechazo: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate },
    });

    if (!candidate) {
      throw new NotFoundException(
        `Candidato con ID ${id_candidate} no encontrado.`
      );
    }

    const updatedCandidate = await this.prisma.candidate.update({
      where: { id_candidate },
      data: {
        estado_candidate: "No Aprobado",
        motivo_rechazo: motivo_rechazo || "Sin motivo especificado",
        electionId: null,
      },
      include: {
        election: {
          select: {
            id_election: true,
            nombre_election: true,
            estado_election: true,
          },
        },
      },
    });

    // Crear notificación de rechazo
    await this.notificationsService.create({
      id_candidate,
      titulo: "❌ Postulación Rechazada",
      mensaje: `Tu postulación ha sido rechazada. Motivo: ${
        motivo_rechazo || "Sin motivo especificado"
      }. Puedes postularte a otras elecciones disponibles.`,
      tipo: "rechazo",
    });

    const { contrasena_candidate, ...result } = updatedCandidate;
    return result;
  }

  async create(
    createCandidateDto: CreateCandidateDto,
    foto_candidate?: Express.Multer.File
  ) {
    const numDocBigInt = BigInt(createCandidateDto.num_doc_candidate);

    const existing = await this.prisma.candidate.findFirst({
      where: {
        OR: [
          { correo_candidate: createCandidateDto.correo_candidate },
          { num_doc_candidate: numDocBigInt },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        "El correo o número de documento ya está registrado."
      );
    }

    const hashedPassword = await bcrypt.hash(
      createCandidateDto.contrasena_candidate,
      10
    );

    let fotoUrl: string | null = null;
    if (foto_candidate) {
      try {
        fotoUrl = await this.imageProcessor.processImage(
          foto_candidate.path,
          createCandidateDto.nombre_candidate,
          createCandidateDto.apellido_candidate
        );
      } catch (error) {
        throw new BadRequestException(
          "Error al procesar la imagen: " + error.message
        );
      }
    }

    const dataToCreate: any = {
      nombre_candidate: createCandidateDto.nombre_candidate,
      apellido_candidate: createCandidateDto.apellido_candidate,
      tipo_doc_candidate: createCandidateDto.tipo_doc_candidate,
      num_doc_candidate: numDocBigInt,
      correo_candidate: createCandidateDto.correo_candidate,
      contrasena_candidate: hashedPassword,
      estado_candidate: "Inactivo",
      foto_candidate: fotoUrl,
      role: {
        connect: { id_role: createCandidateDto.id_role },
      },
      career: {
        connect: { id_career: createCandidateDto.id_career },
      },
    };

    if (createCandidateDto.id_election) {
      const election = await this.prisma.election.findUnique({
        where: { id_election: createCandidateDto.id_election },
      });

      if (!election) {
        throw new NotFoundException(
          `La elección con ID ${createCandidateDto.id_election} no fue encontrada.`
        );
      }

      dataToCreate.election = {
        connect: { id_election: createCandidateDto.id_election },
      };
      dataToCreate.estado_candidate = "Pendiente";
    }

    const candidate = await this.prisma.candidate.create({
      data: dataToCreate,
      include: {
        election: {
          select: {
            id_election: true,
            nombre_election: true,
            estado_election: true,
          },
        },
        career: {
          select: {
            nombre_career: true,
            facultad_career: true,
          },
        },
      },
    });

    const { contrasena_candidate, ...result } = candidate;
    return result;
  }

  async uploadPhoto(candidateId: number, file: Express.Multer.File) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException("Candidato no encontrado");
    }

    try {
      if (candidate.foto_candidate) {
        await this.imageProcessor.deleteImage(candidate.foto_candidate);
      }

      const photoUrl = await this.imageProcessor.processImage(
        file.path,
        candidate.nombre_candidate,
        candidate.apellido_candidate
      );

      const updatedCandidate = await this.prisma.candidate.update({
        where: { id_candidate: candidateId },
        data: { foto_candidate: photoUrl },
      });

      return {
        message: "Foto subida exitosamente",
        foto_candidate: updatedCandidate.foto_candidate,
      };
    } catch (error) {
      throw new BadRequestException(
        "Error al procesar la imagen: " + error.message
      );
    }
  }

  async deletePhoto(candidateId: number) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id_candidate: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException("Candidato no encontrado");
    }

    if (!candidate.foto_candidate) {
      throw new BadRequestException("El candidato no tiene foto");
    }

    await this.imageProcessor.deleteImage(candidate.foto_candidate);

    await this.prisma.candidate.update({
      where: { id_candidate: candidateId },
      data: { foto_candidate: null },
    });

    return {
      message: "Foto eliminada exitosamente",
    };
  }

  async login(loginCandidateDto: LoginCandidateDto) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { correo_candidate: loginCandidateDto.correo_candidate },
      include: {
        election: {
          select: {
            id_election: true,
            nombre_election: true,
            estado_election: true,
          },
        },
        career: {
          select: {
            nombre_career: true,
            facultad_career: true,
          },
        },
        role: {
          select: {
            id_role: true,
            nombre_role: true,
          },
        },
      },
    });

    if (
      !candidate ||
      !(await bcrypt.compare(
        loginCandidateDto.contrasena_candidate,
        candidate.contrasena_candidate
      ))
    ) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    // Verificar que el candidato esté activo
    if (candidate.estado_candidate === "Inactivo") {
      throw new UnauthorizedException(
        "Tu cuenta está inactiva. Contacta al administrador."
      );
    }

    const { contrasena_candidate, ...result } = candidate;

    // Asegurar que la respuesta tenga una estructura consistente
    return {
      success: true,
      message: "Login exitoso",
      candidate: {
        ...result,
        num_doc_candidate: result.num_doc_candidate.toString(),
      },
    };
  }
}