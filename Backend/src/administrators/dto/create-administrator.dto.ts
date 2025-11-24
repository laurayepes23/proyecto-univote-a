import { ApiProperty } from "@nestjs/swagger";

export class CreateAdministratorDto {
  @ApiProperty({ description: "Nombre del administrador", example: "Laura" })
  nombre_admin!: string;

  @ApiProperty({ description: "Apellido del administrador", example: "Gomez" })
  apellido_admin!: string;

  @ApiProperty({ description: "Tipo de documento (CC, TI, CE)", example: "CC" })
  tipo_doc_admin!: string;

  @ApiProperty({ description: "Número de documento", example: 123456789 })
  num_doc_admin!: number;

  @ApiProperty({
    description: "Correo electrónico",
    example: "admin@example.com",
  })
  correo_admin!: string;

  @ApiProperty({
    description: "Contraseña en texto plano (se encripta al guardar)",
    example: "Secret123",
  })
  contrasena_admin!: string;
}
