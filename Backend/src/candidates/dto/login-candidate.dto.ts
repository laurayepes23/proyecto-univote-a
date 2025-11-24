import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginCandidateDto {
  @ApiProperty({
    description: "Correo del candidato",
    example: "candidato@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  correo_candidate!: string;

  @ApiProperty({
    description: "Contraseña del candidato",
    example: "Secret123",
  })
  @IsString()
  @IsNotEmpty()
  contrasena_candidate!: string;
}
