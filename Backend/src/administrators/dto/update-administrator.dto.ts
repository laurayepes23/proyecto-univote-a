// src/administrators/dto/update-administrator.dto.ts
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsIn,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAdministratorDto {
  @ApiPropertyOptional({
    description: "Nombre del administrador",
    example: "Laura",
  })
  @IsOptional()
  @IsString()
  nombre_admin?: string;

  @ApiPropertyOptional({
    description: "Apellido del administrador",
    example: "Gomez",
  })
  @IsOptional()
  @IsString()
  apellido_admin?: string;

  @ApiPropertyOptional({
    description: "Tipo de documento (CC, TI, CE)",
    example: "CC",
  })
  @IsOptional()
  @IsString()
  @IsIn(["CC", "TI", "CE"])
  tipo_doc_admin?: string;

  @ApiPropertyOptional({
    description: "Número de documento",
    example: 987654321,
  })
  @IsOptional()
  num_doc_admin?: bigint;

  @ApiPropertyOptional({
    description: "Correo electrónico",
    example: "admin2@example.com",
  })
  @IsOptional()
  @IsEmail()
  correo_admin?: string;

  @ApiPropertyOptional({
    description: "Nueva contraseña (mínimo 6 caracteres)",
    example: "NewSecret123",
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  contrasena_admin?: string;
}
