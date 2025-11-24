import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ElectionsService } from "./elections.service";
import { CreateElectionDto } from "./dto/create-election.dto";
import { UpdateElectionDto } from "./dto/update-election.dto";

@ApiTags("Elections")
@ApiBearerAuth()
@Controller("elections")
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get("results")
  @ApiOperation({ summary: "Obtener resultados globales de elecciones" })
  @ApiResponse({ status: 200, description: "Resultados retornados" })
  getResults() {
    return this.electionsService.getResults();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Crear elección" })
  @ApiResponse({ status: 201, description: "Elección creada" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  create(@Body() createElectionDto: CreateElectionDto) {
    return this.electionsService.create(createElectionDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las elecciones" })
  @ApiResponse({ status: 200, description: "Listado obtenido" })
  findAll() {
    return this.electionsService.findAll();
  }

  // NUEVO: Endpoint que incluye el conteo de candidatos
  @Get("with-candidate-count")
  @ApiOperation({ summary: "Listar elecciones con conteo de candidatos" })
  @ApiResponse({ status: 200, description: "Listado obtenido" })
  async findAllWithCandidateCount() {
    try {
      return await this.electionsService.getElectionsWithCandidateCount();
    } catch (error) {
      throw new BadRequestException(
        "Error al cargar las elecciones con conteo de candidatos",
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener elección por ID" })
  @ApiResponse({ status: 200, description: "Elección encontrada" })
  @ApiResponse({ status: 404, description: "Elección no existe" })
  findOne(@Param("id") id: string) {
    return this.electionsService.findOne(+id);
  }

  // NUEVO: Endpoint específico para votantes (solo candidatos aprobados con propuestas activas)
  @Get("for-voter/:id")
  @ApiOperation({ summary: "Obtener elección filtrada para votante" })
  @ApiResponse({
    status: 200,
    description: "Elección con candidatos aprobados y propuestas activas",
  })
  async findOneForVoter(@Param("id") id: string) {
    try {
      return await this.electionsService.findOneWithProposalsForVoter(+id);
    } catch (error) {
      throw new BadRequestException("Error al cargar la elección para votante");
    }
  }

  // NUEVO: Endpoint para obtener propuestas de una elección
  @Get("proposals/:id")
  @ApiOperation({ summary: "Obtener propuestas de una elección" })
  @ApiResponse({ status: 200, description: "Propuestas retornadas" })
  async getElectionProposals(@Param("id") id: string) {
    try {
      return await this.electionsService.getElectionProposals(+id);
    } catch (error) {
      throw new BadRequestException(
        "Error al cargar las propuestas de la elección",
      );
    }
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Actualizar elección" })
  @ApiResponse({ status: 200, description: "Elección actualizada" })
  update(
    @Param("id") id: string,
    @Body() updateElectionDto: UpdateElectionDto,
  ) {
    return this.electionsService.update(+id, updateElectionDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Eliminar elección" })
  @ApiResponse({ status: 200, description: "Elección eliminada" })
  remove(@Param("id") id: string) {
    return this.electionsService.remove(+id);
  }

  // Nuevo endpoint para verificar si se puede iniciar una elección
  @Get("can-start/:id")
  @ApiOperation({
    summary: "Validar si puede iniciar la elección (reglas completas)",
  })
  @ApiResponse({ status: 200, description: "Resultado validación" })
  async canStart(@Param("id") id: string) {
    try {
      const validation = await this.electionsService.canStartElection(+id);
      return validation;
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al validar inicio",
      );
    }
  }

  // Endpoint simplificado para verificar inicio
  @Get("can-start-simple/:id")
  @ApiOperation({ summary: "Validar inicio simple (reglas reducidas)" })
  async canStartSimple(@Param("id") id: string) {
    try {
      return await this.electionsService.canStartSimple(+id);
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al validar inicio simple",
      );
    }
  }

  // Nuevo endpoint para obtener estadísticas
  @Get("stats/:id")
  @ApiOperation({ summary: "Obtener estadísticas de una elección" })
  async getStats(@Param("id") id: string) {
    try {
      return await this.electionsService.getElectionStats(+id);
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al obtener estadísticas",
      );
    }
  }

  // Endpoint para obtener conteo de candidatos
  @Get("candidates-count/:id")
  @ApiOperation({ summary: "Obtener conteo de candidatos de una elección" })
  async getCandidatesCount(@Param("id") id: string) {
    try {
      const count = await this.electionsService.getElectionCandidatesCount(+id);
      return { count };
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al obtener conteo de candidatos",
      );
    }
  }

  // Endpoint para agregar voto en blanco manualmente
  @Post("add-blank-vote/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Agregar voto en blanco manualmente a elección" })
  async addBlankVote(@Param("id") id: string) {
    try {
      return await this.electionsService.addBlankVoteToElection(+id);
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al agregar voto en blanco",
      );
    }
  }

  // Endpoint para iniciar una elección
  @Put("iniciar/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({
    summary: "Iniciar elección (agrega voto en blanco automático)",
  })
  async iniciar(@Param("id") id: string) {
    try {
      const result = await this.electionsService.updateStatus(+id, "Activa");
      return {
        success: true,
        message:
          "Elección iniciada correctamente. Voto en Blanco agregado automáticamente.",
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al iniciar la elección",
      );
    }
  }

  // Endpoint para cerrar una elección
  @Put("cerrar/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Cerrar elección" })
  async cerrar(@Param("id") id: string) {
    try {
      const result = await this.electionsService.updateStatus(
        +id,
        "Finalizada",
      );
      return {
        success: true,
        message: "Elección finalizada correctamente.",
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message ?? "Error al cerrar la elección",
      );
    }
  }

  // Endpoint de debug para verificar candidatos
  @Get("debug/candidates-count/:id")
  @ApiOperation({ summary: "Debug: Conteo detallado de candidatos" })
  async debugCandidatesCount(@Param("id") id: string) {
    try {
      return await this.electionsService.debugCandidatesCount(+id);
    } catch (error) {
      throw new BadRequestException(
        "Error en debug: " + (error?.message ?? "Error desconocido"),
      );
    }
  }
}
