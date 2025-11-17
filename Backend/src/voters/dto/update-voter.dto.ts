// src/voters/dto/update-voter.dto.ts
import { IsString, IsOptional, IsEmail, MinLength, IsIn } from 'class-validator';

export class UpdateVoterDto {
  @IsOptional()
  @IsEmail()
  correo_voter?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  contrasena_voter?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Activo', 'Inactivo'], { message: 'El estado debe ser "Activo" o "Inactivo"' })
  estado_voter?: string;

  // ✅ AGREGAR ESTE CAMPO
  @IsOptional()
  @IsString()
  @IsIn(['CC', 'TI', 'CE'], { message: 'El tipo de documento debe ser CC, TI o CE' })
  tipo_doc_voter?: string;
}