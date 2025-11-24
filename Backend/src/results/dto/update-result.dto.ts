// src/results/dto/update-result.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateResultDto } from "./create-result.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, Min, IsOptional } from "class-validator";

export class UpdateResultDto extends PartialType(CreateResultDto) {
  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsInt()
  @Min(0)
  total_votes?: number;
}
