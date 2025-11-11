// src/votes/votes.controller.ts
import { Controller, Post, Body, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
    constructor(private readonly votesService: VotesService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('votante')
    async create(@Body() createVoteDto: CreateVoteDto, @CurrentUser() user: any) {
        // ID del votante desde el token (no falsificable)
        const voterId = parseInt(user.id);

        // Verificar que no haya votado antes
        const hasVoted = await this.votesService.hasUserVoted(
            voterId,
            createVoteDto.electionId,
        );

        if (hasVoted) {
            throw new ForbiddenException('Ya has emitido tu voto en esta elección');
        }

        // Usar ID del token, no del body
        return this.votesService.createVote({
            ...createVoteDto,
            voterId,
        });
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('administrador')
    async findAll() {
        return this.votesService.getVotes();
    }
}