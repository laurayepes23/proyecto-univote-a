import { Controller, Get, Post, Body, Patch, Put, Param, Delete, BadRequestException } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';

@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}
  
  @Get('results')
  getResults() {
    return this.electionsService.getResults();
  }

  @Post()
  create(@Body() createElectionDto: CreateElectionDto) {
    return this.electionsService.create(createElectionDto);
  }

  @Get()
  findAll() {
    return this.electionsService.findAll();
  }

  // NUEVO: Endpoint que incluye el conteo de candidatos
  @Get('with-candidate-count')
  async findAllWithCandidateCount() {
    try {
      return await this.electionsService.getElectionsWithCandidateCount();
    } catch (error) {
      throw new BadRequestException('Error al cargar las elecciones con conteo de candidatos');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electionsService.findOne(+id);
  }

  // NUEVO: Endpoint específico para votantes (solo candidatos aprobados con propuestas activas)
  @Get('for-voter/:id')
  async findOneForVoter(@Param('id') id: string) {
    try {
      return await this.electionsService.findOneWithProposalsForVoter(+id);
    } catch (error) {
      throw new BadRequestException('Error al cargar la elección para votante');
    }
  }

  // NUEVO: Endpoint para obtener propuestas de una elección
  @Get('proposals/:id')
  async getElectionProposals(@Param('id') id: string) {
    try {
      return await this.electionsService.getElectionProposals(+id);
    } catch (error) {
      throw new BadRequestException('Error al cargar las propuestas de la elección');
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateElectionDto: UpdateElectionDto) {
    return this.electionsService.update(+id, updateElectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.electionsService.remove(+id);
  }
  
  // Nuevo endpoint para verificar si se puede iniciar una elección
  @Get('can-start/:id')
  async canStart(@Param('id') id: string) {
    try {
      const validation = await this.electionsService.canStartElection(+id);
      return validation;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Endpoint simplificado para verificar inicio
  @Get('can-start-simple/:id')
  async canStartSimple(@Param('id') id: string) {
    try {
      return await this.electionsService.canStartSimple(+id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Nuevo endpoint para obtener estadísticas
  @Get('stats/:id')
  async getStats(@Param('id') id: string) {
    try {
      return await this.electionsService.getElectionStats(+id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Endpoint para obtener conteo de candidatos
  @Get('candidates-count/:id')
  async getCandidatesCount(@Param('id') id: string) {
    try {
      const count = await this.electionsService.getElectionCandidatesCount(+id);
      return { count };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Endpoint para agregar voto en blanco manualmente
  @Post('add-blank-vote/:id')
  async addBlankVote(@Param('id') id: string) {
    try {
      return await this.electionsService.addBlankVoteToElection(+id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Endpoint para iniciar una elección
  @Put('iniciar/:id')
  async iniciar(@Param('id') id: string) {
    try {
      const result = await this.electionsService.updateStatus(+id, 'Activa');
      return {
        success: true,
        message: 'Elección iniciada correctamente. Voto en Blanco agregado automáticamente.',
        data: result
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Endpoint para cerrar una elección
  @Put('cerrar/:id')
  async cerrar(@Param('id') id: string) {
    try {
      const result = await this.electionsService.updateStatus(+id, 'Finalizada');
      return {
        success: true,
        message: 'Elección finalizada correctamente.',
        data: result
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Endpoint de debug para verificar candidatos
  @Get('debug/candidates-count/:id')
  async debugCandidatesCount(@Param('id') id: string) {
    try {
      return await this.electionsService.debugCandidatesCount(+id);
    } catch (error) {
      throw new BadRequestException('Error en debug: ' + error.message);
    }
  }
}