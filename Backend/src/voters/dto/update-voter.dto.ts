// src/voters/dto/update-voter.dto.ts
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsIn,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateVoterDto {
  @ApiPropertyOptional({
    description: "Correo del votante",
    example: "ana2@example.com",
  })
  @IsOptional()
  @IsEmail()
  correo_voter?: string;

  @ApiPropertyOptional({
    description: "Nueva contraseña",
    example: "NewSecret123",
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  contrasena_voter?: string;

  @ApiPropertyOptional({
    description: "Estado del votante",
    example: "Inactivo",
    enum: ["Activo", "Inactivo"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["Activo", "Inactivo"], {
    message: 'El estado debe ser "Activo" o "Inactivo"',
  })
  estado_voter?: string;

  @ApiPropertyOptional({
    description: "Tipo de documento",
    example: "TI",
    enum: ["CC", "TI", "CE"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["CC", "TI", "CE"], {
    message: "El tipo de documento debe ser CC, TI o CE",
  })
  tipo_doc_voter?: string;
}
