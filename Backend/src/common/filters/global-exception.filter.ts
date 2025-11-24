import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

/**
 * Filtro global para manejo consistente de excepciones
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Error interno del servidor";
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      details =
        typeof exceptionResponse === "object" ? exceptionResponse : null;
    } else if (
      exception &&
      typeof exception === "object" &&
      "code" in exception &&
      typeof exception.code === "string"
    ) {
      // Manejo de errores de Prisma
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception as any);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(details && { details }),
    };

    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(error: any): string {
    const code = error.code;

    switch (code) {
      case "P2002": {
        const target = error.meta?.target;
        const targetStr =
          typeof target === "string"
            ? target
            : Array.isArray(target)
              ? target.join(", ")
              : "campo único";
        return `Registro duplicado: ${targetStr}`;
      }
      case "P2025":
        return "Registro no encontrado";
      case "P2003":
        return "Violación de llave foránea";
      case "P2021":
        return "Tabla no existe en la base de datos";
      case "P2022":
        return "Columna no existe en la base de datos";
      default:
        return `Error de base de datos: ${error.code}`;
    }
  }
}
