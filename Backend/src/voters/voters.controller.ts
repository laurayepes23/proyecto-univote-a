// src/voters/voters.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
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
import { VotersService } from "./voters.service";
import { CreateVoterDto } from "./dto/create-voter.dto";
import { UpdateVoterDto } from "./dto/update-voter.dto";
import { LoginVoterDto } from "./dto/login-voter.dto";

@ApiTags("Voters")
@ApiBearerAuth()
@Controller("voters")
export class VotersController {
  constructor(private readonly votersService: VotersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Crear votante" })
  @ApiResponse({ status: 201, description: "Votante creado" })
  create(@Body() createVoterDto: CreateVoterDto) {
    console.log("🆕 Creando nuevo votante");
    return this.votersService.create(createVoterDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ApiOperation({ summary: "Login de votante" })
  @ApiResponse({ status: 200, description: "Login exitoso" })
  async login(@Body() loginVoterDto: LoginVoterDto) {
    console.log("🔐 Inicio de sesión votante");
    const voter = await this.votersService.login(
      loginVoterDto.correo_voter,
      loginVoterDto.contrasena_voter,
    );
    return {
      message: "Inicio de sesión exitoso",
      voter: voter,
    };
  }

  @Post("validate-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validar contraseña de votante" })
  async validatePassword(
    @Body() validatePasswordDto: { voterId: number; password: string },
  ) {
    console.log(
      "🔐 Validando contraseña - Voter ID:",
      validatePasswordDto.voterId,
    );
    return this.votersService.validatePassword(
      validatePasswordDto.voterId,
      validatePasswordDto.password,
    );
  }

  @Get()
  @ApiOperation({ summary: "Listar votantes" })
  findAll() {
    console.log("📋 Obteniendo todos los votantes");
    return this.votersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener votante por ID" })
  async findOne(@Param("id") id: string) {
    console.log("🔍 Endpoint findOne llamado - ID:", id);
    try {
      const voterId = parseInt(id);
      if (isNaN(voterId)) {
        throw new Error("ID inválido");
      }
      const result = await this.votersService.findOne(voterId);
      console.log("✅ findOne completado exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error en endpoint findOne:", error);
      throw error;
    }
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Actualizar votante" })
  async update(
    @Param("id") id: string,
    @Body() updateVoterDto: UpdateVoterDto,
  ) {
    console.log(
      "🔄 Endpoint update llamado - ID:",
      id,
      "Data:",
      updateVoterDto,
    );
    try {
      const voterId = parseInt(id);
      if (isNaN(voterId)) {
        throw new Error("ID inválido");
      }
      const result = await this.votersService.update(voterId, updateVoterDto);
      console.log("✅ Update completado exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error en endpoint update:", error);
      throw error;
    }
  }

  @Patch(":id/estado")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Actualizar estado de votante" })
  async updateEstado(
    @Param("id") id: string,
    @Body() updateEstadoDto: { estado_voter: string },
  ) {
    console.log(
      "🔄 Endpoint updateEstado llamado - ID:",
      id,
      "Estado:",
      updateEstadoDto.estado_voter,
    );
    try {
      const voterId = parseInt(id);
      if (isNaN(voterId)) {
        throw new Error("ID inválido");
      }
      const result = await this.votersService.updateEstado(
        voterId,
        updateEstadoDto.estado_voter,
      );
      console.log("✅ UpdateEstado completado exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error en endpoint updateEstado:", error);
      throw error;
    }
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Eliminar votante" })
  remove(@Param("id") id: string) {
    console.log("🗑️ Eliminando votante ID:", id);
    return this.votersService.remove(+id);
  }

  // En src/voters/voters.controller.ts - agrega este endpoint
  @Patch(":id/assign-election")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Asignar elección a votante" })
  async assignElection(
    @Param("id") id: string,
    @Body() assignElectionDto: { electionId: number },
  ) {
    console.log(
      "🔗 Asignando elección a votante ID:",
      id,
      "Elección:",
      assignElectionDto.electionId,
    );
    try {
      const voterId = parseInt(id);
      if (isNaN(voterId)) {
        throw new Error("ID inválido");
      }
      const result = await this.votersService.assignElectionToVoter(
        voterId,
        assignElectionDto.electionId,
      );
      console.log("✅ Elección asignada exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error en endpoint assignElection:", error);
      throw error;
    }
  }
}
