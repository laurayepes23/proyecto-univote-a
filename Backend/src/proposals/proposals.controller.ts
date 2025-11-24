// proposal.controller.ts - ACTUALIZADO
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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";

@ApiTags("Proposals")
@ApiBearerAuth()
@Controller("proposals")
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE")
  @ApiOperation({ summary: "Crear propuesta" })
  @ApiResponse({ status: 201, description: "Propuesta creada" })
  create(@Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(createProposalDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las propuestas (internas)" })
  findAll() {
    return this.proposalsService.findAll();
  }

  @Get("public")
  @ApiOperation({ summary: "Listar propuestas públicas" })
  findAllPublic() {
    return this.proposalsService.findAllPublic();
  }

  // ENDPOINT: Propuestas por elección (sin validación de votante)
  @Get("election/:electionId")
  @ApiOperation({ summary: "Listar propuestas públicas por elección" })
  findAllByElection(@Param("electionId") electionId: string) {
    return this.proposalsService.findAllPublicByElection(+electionId);
  }

  // NUEVO ENDPOINT: Elecciones activas con propuestas
  @Get("active-elections")
  @ApiOperation({ summary: "Elecciones activas con propuestas" })
  getActiveElectionsWithProposals() {
    return this.proposalsService.getActiveElectionsWithProposals();
  }

  @Get("list")
  @ApiOperation({ summary: "Listado público de propuestas" })
  findAllList() {
    return this.proposalsService.findAllPublic();
  }

  @Get("owner/:candidateId")
  @ApiOperation({ summary: "Propuestas de un candidato" })
  findAllByOwner(@Param("candidateId") candidateId: string) {
    return this.proposalsService.findAllByOwner(+candidateId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener propuesta por ID" })
  findOne(@Param("id") id: string) {
    return this.proposalsService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE")
  @ApiOperation({ summary: "Actualizar propuesta" })
  update(
    @Param("id") id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(+id, updateProposalDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE")
  @ApiOperation({ summary: "Eliminar propuesta" })
  remove(@Param("id") id: string) {
    return this.proposalsService.remove(+id);
  }
}
