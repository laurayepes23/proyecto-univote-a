import { IsNotEmpty } from "class-validator";

// src/votes/dto/create-vote.dto.ts
export class CreateVoteDto {

    @IsNotEmpty()
    // El voterId se toma del token (no del body)

    @IsNotEmpty()
    candidateId: number;

    @IsNotEmpty()
    electionId: number; // NUEVO: Para identificar la elección
}