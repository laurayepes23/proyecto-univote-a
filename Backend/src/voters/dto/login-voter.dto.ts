// src/voters/dto/login-voter.dto.ts

import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginVoterDto {
  @ApiProperty({
    description: "Correo del votante",
    example: "ana@example.com",
  })
  @IsEmail()
  correo_voter!: string;

  @ApiProperty({ description: "Contraseña del votante", example: "Secret123" })
  @IsString()
  contrasena_voter!: string;
}
