// src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async findByCandidateId(id_candidate: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { id_candidate },
      orderBy: { fecha_creacion: 'desc' },
    });

    // Convertir las fechas a string para evitar problemas de serialización
    return notifications.map(notification => ({
      ...notification,
      fecha_creacion: notification.fecha_creacion.toISOString()
    }));
  }

  async markAsRead(id_notification: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id_notification },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id_notification },
      data: { leida: true },
    });

    return {
      ...updatedNotification,
      fecha_creacion: updatedNotification.fecha_creacion.toISOString()
    };
  }

  async getUnreadCount(id_candidate: number) {
    return await this.prisma.notification.count({
      where: { 
        id_candidate,
        leida: false 
      },
    });
  }

  async delete(id_notification: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id_notification },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return await this.prisma.notification.delete({
      where: { id_notification },
    });
  }
}