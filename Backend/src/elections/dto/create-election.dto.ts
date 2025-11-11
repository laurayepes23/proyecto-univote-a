// src/elections/dto/create-election.dto.ts
import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// Nota: Eliminamos id_admin del DTO para que el backend lo derive del usuario autenticado.
// También hacemos opcional estado_election y por defecto será 'Programada' en el servicio.
export class CreateElectionDto {
    @IsString()
    @IsNotEmpty()
    nombre_election: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    fecha_inicio: Date;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    fecha_fin: Date;

    @IsString()
    @IsOptional()
    estado_election?: string;
}
