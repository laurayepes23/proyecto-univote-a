import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateCareerDto } from "./create-career.dto";

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
  @ApiPropertyOptional({
    description: "Nombre de la carrera",
    example: "Ingeniería Industrial",
  })
  nombre_career?: string;

  @ApiPropertyOptional({
    description: "Facultad asociada",
    example: "Administración",
  })
  facultad_career?: string;
}
