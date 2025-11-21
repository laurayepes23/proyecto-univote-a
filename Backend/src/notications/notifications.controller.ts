// src/notifications/notifications.controller.ts
import { Controller, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('candidate/:id_candidate')
  findByCandidateId(@Param('id_candidate', ParseIntPipe) id_candidate: number) {
    return this.notificationsService.findByCandidateId(id_candidate);
  }

  @Patch(':id_notification/read')
  markAsRead(@Param('id_notification', ParseIntPipe) id_notification: number) {
    return this.notificationsService.markAsRead(id_notification);
  }

  @Get('candidate/:id_candidate/unread-count')
  getUnreadCount(@Param('id_candidate', ParseIntPipe) id_candidate: number) {
    return this.notificationsService.getUnreadCount(id_candidate);
  }

  @Delete(':id_notification')
  delete(@Param('id_notification', ParseIntPipe) id_notification: number) {
    return this.notificationsService.delete(id_notification);
  }
}