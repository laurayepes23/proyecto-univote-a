import { Controller, Get, Post, Body, Patch, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('elections')
@UseGuards(JwtAuthGuard)
@SkipThrottle() // Deshabilita rate limiting para todo el controlador de elecciones
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}
  
  // --- NUEVO ENDPOINT PARA LOS RESULTADOS ---
  @Get('results')
  getResults() {
    return this.electionsService.getResults();
  }


  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  create(@Body() createElectionDto: CreateElectionDto, @CurrentUser() user: any) {
    console.log(`Elección creada por: ${user.correo}`);
    return this.electionsService.create(createElectionDto, user);
  }

  @Get()
  @SkipThrottle()
  findAll() {
    return this.electionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  update(@Param('id') id: string, @Body() updateElectionDto: UpdateElectionDto) {
    return this.electionsService.update(+id, updateElectionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.electionsService.remove(+id);
  }
  
  // Nuevo endpoint para iniciar una elección
  @Put('iniciar/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  iniciar(@Param('id') id: string) {
    return this.electionsService.updateStatus(+id, 'Activa');
  }

  // Nuevo endpoint para cerrar una elección
  @Put('cerrar/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  cerrar(@Param('id') id: string) {
    return this.electionsService.updateStatus(+id, 'Finalizada');
  }
}