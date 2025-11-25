// src/votes/dto/create-vote.dto.ts
import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVoteDto {
  @ApiProperty({ description: "ID del votante que emite el voto", example: 10 })
  @IsNotEmpty()
  @IsNumber()
  voterId!: number;

  @ApiProperty({
    description: "ID del candidato elegido (o voto en blanco si corresponde)",
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  candidateId!: number;

  @ApiProperty({
    description: "ID de la elección en la que se vota",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  electionId!: number;
}
