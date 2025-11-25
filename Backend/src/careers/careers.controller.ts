// src/careers/careers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CareersService } from "./careers.service";
import { CreateCareerDto } from "./dto/create-career.dto";
import { UpdateCareerDto } from "./dto/update-career.dto";

@ApiTags("Careers")
@ApiBearerAuth()
@Controller("careers")
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Crear carrera" })
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar carreras" })
  findAll() {
    return this.careersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener carrera por ID" })
  findOne(@Param("id") id: string) {
    return this.careersService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Actualizar carrera" })
  update(@Param("id") id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(+id, updateCareerDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Eliminar carrera" })
  remove(@Param("id") id: string) {
    return this.careersService.remove(+id);
  }
}
