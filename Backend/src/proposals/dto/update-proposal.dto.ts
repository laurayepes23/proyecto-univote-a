// update.proposal.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateProposalDto } from "./create-proposal.dto";
import { IsOptional, IsEnum } from "class-validator";

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @ApiPropertyOptional({
    description: "Estado actualizado",
    example: "Inactiva",
    enum: ["Activa", "Inactiva"],
  })
  @IsOptional()
  @IsEnum(["Activa", "Inactiva"])
  estado_proposal?: string;
}
