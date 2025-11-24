import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

interface LoginDto {
  correo: string;
  contrasena: string;
}

@ApiTags("Auth")
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "Login unificado para Administrador, Candidato o Votante",
  })
  @ApiResponse({
    status: 200,
    description: "Login exitoso, retorna token y datos usuario",
  })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  async login(@Body() body: LoginDto): Promise<{
    token: string;
    usuario: { id: number; nombre: string; rol: string; correo: string };
  }> {
    return this.authService.unifiedLogin(body.correo, body.contrasena);
  }
}
