import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MaxLength(40, { message: 'El nombre no puede tener más de 40 caracteres' })
  @Matches(/^[^<>{}[\]\\]*$/, { 
    message: 'El nombre no puede contener caracteres especiales (<, >, {, }, [, ], \\)' 
  })
  nombre: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(40, { message: 'El email no puede tener más de 40 caracteres' })
  @Matches(/^[^<>{}[\]\\]*$/, { 
    message: 'El email no puede contener caracteres especiales (<, >, {, }, [, ], \\)' 
  })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15, { message: 'El teléfono no puede tener más de 15 caracteres' })
  @Matches(/^[\d+\-\s()]*$/, { 
    message: 'El teléfono solo puede contener números, +, -, () y espacios' 
  })
  telefono?: string;

  @IsNotEmpty({ message: 'El motivo es requerido' })
  @IsString()
  motivo: string;

  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString()
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El mensaje no puede tener más de 500 caracteres' })
  @Matches(/^[^<>{}[\]\\]*$/, { 
    message: 'El mensaje no puede contener caracteres especiales (<, >, {, }, [, ], \\)' 
  })
  mensaje: string;
}