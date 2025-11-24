import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateRoleDto } from "./create-role.dto";

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({ description: "Nombre del rol", example: "CANDIDATE" })
  nombre_role?: string;
}
