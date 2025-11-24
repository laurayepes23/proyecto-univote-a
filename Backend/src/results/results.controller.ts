// src/results/results.controller.ts

import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ResultsService } from "./results.service";

@ApiTags("Results")
@ApiBearerAuth()
@Controller("results")
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @ApiOperation({ summary: "Obtener resultados de elecciones" })
  findAll() {
    // Ahora esta llamada funciona porque el método ya está implementado en el servicio
    return this.resultsService.findElectionResults();
  }
}
