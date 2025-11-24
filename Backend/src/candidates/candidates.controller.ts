import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { CandidatesService } from "./candidates.service";
import { NotificationsService } from "../notications/notifications.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { LoginCandidateDto } from "./dto/login-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { ApplyToElectionDto } from "./dto/apply-to-election.dto";
import { multerConfig } from "./upload.config";

@ApiTags("Candidates")
@ApiBearerAuth()
@Controller("candidates")
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get(":id")
  @ApiOperation({ summary: "Obtener candidato por ID" })
  @ApiResponse({ status: 200, description: "Candidato encontrado" })
  @ApiResponse({ status: 404, description: "Candidato no existe" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.candidatesService.findOne(id);
  }

  @Post("apply")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE")
  @ApiOperation({ summary: "Aplicar candidatura a una elección" })
  @ApiResponse({ status: 200, description: "Aplicación registrada" })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o reglas violadas",
  })
  applyToElection(@Body() applyToElectionDto: ApplyToElectionDto) {
    return this.candidatesService.applyToElection(applyToElectionDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los candidatos" })
  @ApiResponse({ status: 200, description: "Listado obtenido" })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get(":id/proposals")
  @ApiOperation({ summary: "Obtener candidato con propuestas" })
  @ApiResponse({
    status: 200,
    description: "Información del candidato y sus propuestas",
  })
  findOneWithProposals(@Param("id", ParseIntPipe) id: number) {
    return this.candidatesService.findOneWithProposals(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Actualizar candidato" })
  @ApiResponse({ status: 200, description: "Candidato actualizado" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Post("register")
  @UseInterceptors(FileInterceptor("foto_candidate", multerConfig))
  @ApiOperation({ summary: "Registrar candidato (con foto opcional)" })
  @ApiResponse({ status: 201, description: "Candidato creado" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  create(
    @Body() createCandidateDto: CreateCandidateDto,
    @UploadedFile() foto_candidate?: Express.Multer.File,
  ) {
    return this.candidatesService.create(createCandidateDto, foto_candidate);
  }

  @Post(":id/photo")
  @UseInterceptors(FileInterceptor("photo", multerConfig))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Subir/actualizar foto de candidato" })
  @ApiResponse({ status: 200, description: "Foto actualizada" })
  @ApiResponse({ status: 400, description: "Sin imagen o inválida" })
  async uploadPhoto(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("No se ha proporcionado ninguna imagen");
    }

    return this.candidatesService.uploadPhoto(id, file);
  }

  @Delete(":id/photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Eliminar foto de candidato" })
  @ApiResponse({ status: 200, description: "Foto eliminada" })
  @ApiResponse({ status: 404, description: "Candidato o foto no existe" })
  async deletePhoto(@Param("id", ParseIntPipe) id: number) {
    return this.candidatesService.deletePhoto(id);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login de candidato" })
  @ApiResponse({ status: 200, description: "Login exitoso" })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  login(@Body() loginCandidateDto: LoginCandidateDto) {
    return this.candidatesService.login(loginCandidateDto);
  }

  @Post("validate-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Validar contraseña de candidato" })
  @ApiResponse({ status: 200, description: "Resultado de validación" })
  async validatePassword(
    @Body() validatePasswordDto: { candidateId: number; password: string },
  ) {
    return this.candidatesService.validatePassword(
      validatePasswordDto.candidateId,
      validatePasswordDto.password,
    );
  }

  @Patch(":id/withdraw-election")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE")
  @ApiOperation({ summary: "Retirarse de la elección" })
  @ApiResponse({
    status: 200,
    description: "Candidato retirado de la elección",
  })
  async withdrawFromElection(@Param("id", ParseIntPipe) id: number) {
    return this.candidatesService.withdrawFromElection(id);
  }

  @Patch(":id/approve")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Aprobar candidatura" })
  @ApiResponse({ status: 200, description: "Candidato aprobado" })
  approveCandidate(@Param("id", ParseIntPipe) id: number) {
    return this.candidatesService.approveCandidate(id);
  }

  @Patch(":id/reject")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Rechazar candidatura" })
  @ApiResponse({ status: 200, description: "Candidato rechazado con motivo" })
  @ApiResponse({ status: 400, description: "Motivo de rechazo faltante" })
  async rejectCandidate(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { motivo_rechazo: string },
  ) {
    if (!body.motivo_rechazo || body.motivo_rechazo.trim() === "") {
      throw new BadRequestException("El motivo de rechazo es obligatorio");
    }
    return this.candidatesService.rejectCandidate(id, body.motivo_rechazo);
  }

  @Get(":id/notifications")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Listar notificaciones de un candidato" })
  @ApiResponse({ status: 200, description: "Listado de notificaciones" })
  getCandidateNotifications(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.findByCandidateId(id);
  }
}
