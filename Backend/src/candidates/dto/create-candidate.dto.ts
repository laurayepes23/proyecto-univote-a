import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCandidateDto {
  @ApiProperty({ description: "Nombre del candidato", example: "Carlos" })
  @IsString()
  @IsNotEmpty()
  nombre_candidate!: string;

  @ApiProperty({ description: "Apellido del candidato", example: "Ramirez" })
  @IsString()
  @IsNotEmpty()
  apellido_candidate!: string;

  @ApiProperty({ description: "Tipo de documento (CC, TI, CE)", example: "CC" })
  @IsString()
  @IsNotEmpty()
  tipo_doc_candidate!: string;

  @ApiProperty({ description: "Número de documento", example: 11223344 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @IsInt()
  num_doc_candidate!: number;

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

  @ApiProperty({ description: "ID del rol asignado", example: 3 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @IsInt()
  id_role!: number;

  @ApiProperty({ description: "ID de la carrera", example: 5 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @IsInt()
  id_career!: number;

  @ApiPropertyOptional({
    description: "Estado del candidato",
    example: "Pendiente",
  })
  @IsOptional()
  @IsString()
  estado_candidate?: string;

  @ApiPropertyOptional({
    description: "Ruta de la foto del candidato",
    example: "uploads/candidatos/foto1.jpg",
  })
  @IsOptional()
  @IsString()
  foto_candidate?: string;

  @ApiPropertyOptional({
    description: "ID de la elección a la que se postula",
    example: 2,
  })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsOptional()
  @IsInt()
  id_election?: number;
}
