import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from '../email/email.service';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createContactDto: CreateContactDto) {
    try {
      this.logger.log(`Recibido formulario de contacto de: ${createContactDto.nombre}`);

      // Proporcionar valor por defecto para teléfono
      const contactData = {
        nombre: createContactDto.nombre,
        email: createContactDto.email,
        telefono: createContactDto.telefono || '', // Valor por defecto
        motivo: createContactDto.motivo,
        mensaje: createContactDto.mensaje
      };

      const emailSent = await this.emailService.sendContactEmail(contactData);

      if (emailSent) {
        return {
          success: true,
          message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
        };
      } else {
        return {
          success: false,
          message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
        };
      }
    } catch (error) {
      this.logger.error('Error procesando formulario de contacto:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo más tarde.',
      };
    }
  }
}