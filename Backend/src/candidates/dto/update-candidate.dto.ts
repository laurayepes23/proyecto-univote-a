// update-candidate.dto.ts
import {
  IsString,
  IsOptional,
  IsIn,
  IsEmail,
  MinLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCandidateDto {
  @ApiPropertyOptional({
    description: "Estado del candidato",
    example: "Aprobado",
    enum: ["Aprobado", "No Aprobado", "Pendiente"],
  })
  @IsString()
  @IsOptional()
  @IsIn(["Aprobado", "No Aprobado", "Pendiente"])
  estado_candidate?: string;

  @ApiPropertyOptional({
    description: "Correo del candidato",
    example: "candidato2@example.com",
  })
  @IsOptional()
  @IsEmail()
  correo_candidate?: string;

  @ApiPropertyOptional({
    description: "Nueva contraseña",
    example: "NewSecret123",
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  contrasena_candidate?: string;

  @ApiPropertyOptional({
    description: "Tipo de documento",
    example: "TI",
    enum: ["CC", "TI", "CE"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["CC", "TI", "CE"])
  tipo_doc_candidate?: string;
}
