// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("candidate/:id_candidate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Listar notificaciones de un candidato" })
  findByCandidateId(@Param("id_candidate", ParseIntPipe) id_candidate: number) {
    return this.notificationsService.findByCandidateId(id_candidate);
  }

  @Patch(":id_notification/read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Marcar notificación como leída" })
  markAsRead(@Param("id_notification", ParseIntPipe) id_notification: number) {
    return this.notificationsService.markAsRead(id_notification);
  }

  @Get("candidate/:id_candidate/unread-count")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Obtener conteo de notificaciones no leídas" })
  getUnreadCount(@Param("id_candidate", ParseIntPipe) id_candidate: number) {
    return this.notificationsService.getUnreadCount(id_candidate);
  }

  @Delete(":id_notification")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CANDIDATE", "ADMIN")
  @ApiOperation({ summary: "Eliminar notificación" })
  delete(@Param("id_notification", ParseIntPipe) id_notification: number) {
    return this.notificationsService.delete(id_notification);
  }
}
