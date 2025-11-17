// src/administrators/dto/update-administrator.dto.ts
import { IsString, IsOptional, IsEmail, MinLength, IsIn } from 'class-validator';

export class UpdateAdministratorDto {
  @IsOptional()
  @IsString()
  nombre_admin?: string;

  @IsOptional()
  @IsString()
  apellido_admin?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CC', 'TI', 'CE'])
  tipo_doc_admin?: string;

  @IsOptional()
  num_doc_admin?: bigint;

  @IsOptional()
  @IsEmail()
  correo_admin?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  contrasena_admin?: string;
}