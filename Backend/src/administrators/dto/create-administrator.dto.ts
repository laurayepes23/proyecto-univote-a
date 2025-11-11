import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAdministratorDto {
    @IsString()
    @IsNotEmpty()
    nombre_admin: string;

    @IsString()
    @IsNotEmpty()
    apellido_admin: string;

    @IsString()
    @IsNotEmpty()
    tipo_doc_admin: string;

    @IsNumber()
    @IsNotEmpty()
    num_doc_admin: number;

    @IsEmail()
    @IsNotEmpty()
    correo_admin: string;

    @IsString()
    @IsNotEmpty()
    contrasena_admin: string;
}
