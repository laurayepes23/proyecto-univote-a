import { ApiProperty } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({ description: "ID del candidato destinatario", example: 1 })
  id_candidate!: number;

  @ApiProperty({
    description: "Título de la notificación",
    example: "Perfil aprobado",
  })
  titulo!: string;

  @ApiProperty({
    description: "Mensaje de la notificación",
    example: "Tu candidatura ha sido aprobada.",
  })
  mensaje!: string;

  @ApiProperty({ description: "Tipo de notificación", example: "INFO" })
  tipo!: string;
}
