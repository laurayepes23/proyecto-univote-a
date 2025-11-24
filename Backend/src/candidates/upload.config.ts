import { diskStorage } from "multer";
import type { Request, Express } from "express";
import { extname, basename } from "path";
import { BadRequestException } from "@nestjs/common";

// Sanitizar nombre de archivo
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Reemplazar caracteres especiales
    .replace(/_{2,}/g, "_") // Evitar múltiples guiones bajos consecutivos
    .toLowerCase();
}

export const multerConfig = {
  storage: diskStorage({
    destination: "./uploads/candidatos",
    filename: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: any, filename: string) => void,
    ) => {
      const timestamp = Date.now();
      const rand = Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname).toLowerCase();
      const baseName = sanitizeFilename(
        basename(file.originalname, ext).substring(0, 50),
      ); // Limitar longitud
      callback(null, `candidate_${timestamp}_${rand}_${baseName}${ext}`);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB (aumentado de 2MB para mejor UX)
    files: 1, // Solo un archivo a la vez
  },

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Validar MIME type (no solo extensión)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    const ext = extname(file.originalname).toLowerCase();
    const mimeValid = allowedMimeTypes.includes(file.mimetype);
    const extValid = allowedExtensions.includes(ext);

    if (!mimeValid || !extValid) {
      return callback(
        new BadRequestException(
          "Solo se permiten imágenes JPEG, PNG o WebP. Tipo recibido: " +
            file.mimetype,
        ),
        false,
      );
    }

    // Validar tamaño del nombre del archivo
    if (file.originalname.length > 255) {
      return callback(
        new BadRequestException("Nombre de archivo demasiado largo"),
        false,
      );
    }

    callback(null, true);
  },
};
