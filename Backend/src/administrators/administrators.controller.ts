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
import { CreateAdministratorDto } from "./dto/create-administrator.dto";
import { UpdateAdministratorDto } from "./dto/update-administrator.dto";
import { AdministratorsService } from "./administrators.servicie";
import { LoginAdminDto } from "./dto/login-admin.dto";

@ApiTags("Administrators")
@ApiBearerAuth()
@Controller("administrators")
export class AdministratorsController {
  constructor(private readonly administratorsService: AdministratorsService) {}

  // Crear un Administrador
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Crear un administrador" })
  @ApiResponse({
    status: 201,
    description: "Administrador creado exitosamente",
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "No autorizado" })
  create(@Body() newAdministrator: CreateAdministratorDto) {
    return this.administratorsService.create(newAdministrator);
  }

  // Iniciar sesión del administrador
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login de administrador" })
  @ApiResponse({ status: 200, description: "Login exitoso" })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  login(@Body() loginAdminDto: LoginAdminDto) {
    return this.administratorsService.login(
      loginAdminDto.correo_admin,
      loginAdminDto.contrasena_admin,
    );
  }

  // ✅ NUEVO ENDPOINT: Validar contraseña
  @Post("validate-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validar contraseña de administrador" })
  @ApiResponse({
    status: 200,
    description: "Contraseña válida/resultado de validación",
  })
  @ApiResponse({ status: 401, description: "No autenticado" })
  validatePassword(
    @Body() validatePasswordDto: { adminId: number; password: string },
  ) {
    return this.administratorsService.validatePassword(
      validatePasswordDto.adminId,
      validatePasswordDto.password,
    );
  }

  // Obtener todos los administradores
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Listar todos los administradores" })
  @ApiResponse({ status: 200, description: "Listado obtenido" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "No autorizado" })
  findAll() {
    return this.administratorsService.findAll();
  }

  // Consultar un administrador por id
  @Get(":id")
  @ApiOperation({ summary: "Obtener administrador por ID" })
  @ApiResponse({ status: 200, description: "Administrador encontrado" })
  @ApiResponse({ status: 404, description: "Administrador no existe" })
  findOne(@Param("id") id: string) {
    return this.administratorsService.findOne(+id);
  }

  // Actualizar un administrador
  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Actualizar un administrador" })
  @ApiResponse({ status: 200, description: "Administrador actualizado" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "No autorizado" })
  update(
    @Param("id") id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    return this.administratorsService.update(+id, updateAdministratorDto);
  }

  // Eliminar un administrador
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Eliminar un administrador" })
  @ApiResponse({ status: 200, description: "Administrador eliminado" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "No autorizado" })
  @ApiResponse({ status: 404, description: "Administrador no existe" })
  remove(@Param("id") id: string) {
    return this.administratorsService.remove(+id);
  }
}
