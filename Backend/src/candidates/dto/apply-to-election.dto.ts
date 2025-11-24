import { IsInt, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ApplyToElectionDto {
  @ApiProperty({ description: "ID del candidato que aplica", example: 1 })
  @IsInt({ message: "El ID del candidato debe ser un número entero." })
  @IsNotEmpty({ message: "El ID del candidato es requerido." })
  candidateId!: number;

  @ApiProperty({ description: "ID de la elección destino", example: 2 })
  @IsInt({ message: "El ID de la elección debe ser un número entero." })
  @IsNotEmpty({ message: "El ID de la elección es requerido." })
  electionId!: number;
}
