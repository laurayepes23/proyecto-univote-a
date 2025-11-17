import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.verifyTransporter();
  }

  // Actualizar el tipo para aceptar telefono opcional
  async sendContactEmail(contactData: {
    nombre: string;
    email: string;
    telefono?: string;  // Hacer opcional aquí también
    motivo: string;
    mensaje: string;
  }): Promise<boolean> {
    try {
      const { nombre, email, telefono, motivo, mensaje } = contactData;

      const mailOptions = {
        from: `"Univote Contacto" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Contacto Univote: ${motivo}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
              .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
              .label { font-weight: bold; color: #1e40af; display: inline-block; width: 120px; }
              .message { background: #e2e8f0; padding: 15px; border-radius: 5px; margin-top: 15px; white-space: pre-line; border: 1px solid #cbd5e1; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #1e40af; color: #64748b; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0;">📧 Nuevo mensaje de contacto - Univote</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Nombre:</span> ${nombre}
              </div>
              <div class="field">
                <span class="label">📧 Email:</span> 
                <a href="mailto:${email}">${email}</a>
              </div>
              <div class="field">
                <span class="label">📞 Teléfono:</span> 
                ${telefono ? `<a href="tel:${telefono}">${telefono}</a>` : 'No proporcionado'}
              </div>
              <div class="field">
                <span class="label">🎯 Motivo:</span> 
                <strong>${motivo}</strong>
              </div>
              <div style="margin-top: 20px;">
                <span class="label">💬 Mensaje:</span>
                <div class="message">${mensaje}</div>
              </div>
            </div>
            <div class="footer">
              <p>✉️ Este mensaje fue enviado desde el formulario de contacto de UnivotE</p>
              <p>🕐 Fecha: ${new Date().toLocaleString('es-CO', { 
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p>🌐 Sistema: ${process.env.NODE_ENV || 'development'}</p>
            </div>
          </body>
          </html>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Correo enviado exitosamente de: ${nombre} (${email}) - Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Error enviando correo de contacto:', error);
      return false;
    }
  }

  async verifyTransporter(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Transporter de correo verificado correctamente');
      return true;
    } catch (error) {
      this.logger.error('❌ Error verificando transporter de correo:', error);
      return false;
    }
  }
}