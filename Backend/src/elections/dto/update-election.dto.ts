// src/elections/dto/update-election.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateElectionDto } from "./create-election.dto";

export class UpdateElectionDto extends PartialType(CreateElectionDto) {
  @ApiPropertyOptional({
    description: "Nuevo estado de la elección",
    example: "Activa",
  })
  estado_election?: string;
}
