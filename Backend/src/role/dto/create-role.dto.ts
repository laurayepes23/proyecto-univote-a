// src/roles/dto/create-role.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class CreateRoleDto {
  @ApiProperty({ description: "Nombre del rol", example: "ADMIN" })
  nombre_role!: string;
}
