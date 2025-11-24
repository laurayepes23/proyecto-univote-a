import {
  IsString,
  IsInt,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateVoterDto {
  @ApiProperty({ description: "Nombre del votante", example: "Ana" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString({ message: "El nombre debe ser texto" })
  nombre_voter!: string;

  @ApiProperty({ description: "Apellido del votante", example: "Diaz" })
  @IsNotEmpty()
  @IsString()
  apellido_voter!: string;

  @ApiProperty({ description: "Tipo de documento", example: "CC" })
  @IsNotEmpty()
  @IsString()
  tipo_doc_voter!: string;

  @ApiProperty({ description: "Número de documento", example: 55667788 })
  @IsNotEmpty()
  @IsNumber()
  num_doc_voter!: number;

  @ApiProperty({
    description: "Correo del votante",
    example: "ana@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  correo_voter!: string;

  @ApiProperty({ description: "Estado del votante", example: "Activo" })
  @IsNotEmpty()
  @IsString()
  estado_voter!: string;

  @ApiProperty({ description: "Contraseña del votante", example: "Secret123" })
  @IsNotEmpty()
  @IsString()
  contrasena_voter!: string;

  @ApiProperty({ description: "ID del rol asignado", example: 2 })
  @IsNotEmpty()
  @IsInt()
  id_role!: number;

  @ApiPropertyOptional({
    description: "ID de la elección asignada",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  id_election?: number;

  @ApiProperty({ description: "ID de la carrera", example: 4 })
  @IsNotEmpty()
  @IsInt()
  id_career!: number;
}
