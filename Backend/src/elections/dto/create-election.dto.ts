// src/elections/dto/create-election.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateElectionDto {
  @ApiProperty({
    description: "Nombre de la elección",
    example: "Elección Consejo Estudiantil 2025",
  })
  @IsString()
  @IsNotEmpty()
  nombre_election!: string;

  @ApiProperty({
    description: "Fecha de inicio (ISO)",
    example: "2025-12-01T08:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fecha_inicio!: Date;

  @ApiProperty({
    description: "Fecha de fin (ISO)",
    example: "2025-12-02T20:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fecha_fin!: Date;

  @ApiProperty({
    description: "Estado inicial de la elección",
    example: "Pendiente",
  })
  @IsString()
  @IsNotEmpty()
  estado_election!: string;

  @ApiProperty({
    description: "ID del administrador que crea la elección",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id_admin!: number;
}
