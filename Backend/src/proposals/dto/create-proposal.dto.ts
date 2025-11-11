import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

// Estados permitidos en el proyecto (usar minúsculas consistente con otros estados: activo, aprobado)
export enum ProposalStatus {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
}

export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  titulo_proposal: string;

  @IsString()
  @IsNotEmpty()
  descripcion_proposal: string;

  @IsOptional()
  @IsEnum(ProposalStatus, { message: 'estado_proposal debe ser: activa | inactiva' })
  estado_proposal?: ProposalStatus; // default se puede asignar en service si viene undefined

  @IsNumber()
  @IsNotEmpty()
  candidateId: number;
}