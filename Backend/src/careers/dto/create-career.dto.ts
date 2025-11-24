// src/careers/dto/create-career.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class CreateCareerDto {
  @ApiProperty({
    description: "Nombre de la carrera",
    example: "Ingeniería de Sistemas",
  })
  nombre_career!: string;

  @ApiProperty({
    description: "Facultad a la que pertenece",
    example: "Ingenierías",
  })
  facultad_career!: string;
}
