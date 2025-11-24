// src/results/dto/create-result.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class CreateResultDto {
  @ApiProperty({
    example: 123,
    description: "Total de votos para el candidato en la elección",
  })
  @IsInt()
  @Min(0)
  total_votes!: number;

  @ApiProperty({ example: 5, description: "ID de la elección asociada" })
  @IsInt()
  electionId!: number;

  @ApiProperty({ example: 42, description: "ID del candidato asociado" })
  @IsInt()
  candidateId!: number;
}
