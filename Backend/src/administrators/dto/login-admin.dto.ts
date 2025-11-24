import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginAdminDto {
  @ApiProperty({
    description: "Correo del administrador",
    example: "admin@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  correo_admin!: string;

  @ApiProperty({
    description: "Contraseña del administrador",
    example: "Secret123",
  })
  @IsString()
  @IsNotEmpty()
  contrasena_admin!: string;
}
