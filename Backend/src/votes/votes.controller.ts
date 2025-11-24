// src/votes/votes.controller.ts
import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { VotesService } from "./votes.service";
import { CreateVoteDto } from "./dto/create-vote.dto";

@ApiTags("Votes")
@ApiBearerAuth()
@Controller("votes")
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("VOTER")
  @ApiOperation({ summary: "Emitir un voto" })
  @ApiResponse({ status: 201, description: "Voto registrado" })
  async create(@Body() createVoteDto: CreateVoteDto) {
    return this.votesService.createVote(createVoteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Listar votos (solo ADMIN)" })
  async findAll() {
    return this.votesService.getVotes();
  }
}
