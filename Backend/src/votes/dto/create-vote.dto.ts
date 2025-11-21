// src/votes/dto/create-vote.dto.ts
import { IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class CreateVoteDto {
    @IsNotEmpty()
    @IsNumber()
    voterId: number;

    @IsNotEmpty()
    @IsNumber()
    candidateId: number;

    @IsNotEmpty()
    @IsNumber()
    electionId: number;
}