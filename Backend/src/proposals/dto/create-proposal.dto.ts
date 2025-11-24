// create.proposal.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProposalDto {
  @ApiProperty({
    description: "Título de la propuesta",
    example: "Mejoras de infraestructura WIFI",
  })
  @IsString()
  @IsNotEmpty()
  titulo_proposal!: string;

  @ApiProperty({
    description: "Descripción detallada de la propuesta",
    example: "Instalar puntos de acceso adicionales en biblioteca y cafetería.",
  })
  @IsString()
  @IsNotEmpty()
  descripcion_proposal!: string;

  @ApiPropertyOptional({
    description: "Estado de la propuesta",
    example: "Activa",
    enum: ["Activa", "Inactiva"],
  })
  @IsString()
  @IsOptional()
  @IsEnum(["Activa", "Inactiva"])
  estado_proposal?: string;

  @ApiProperty({ description: "ID del candidato propietario", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  candidateId!: number;
}
