import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BigIntInterceptor } from "./interceptors/bigint.interceptor";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Request, Response, NextFunction } from "express";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Validar variables de entorno críticas
  if (!process.env.JWT_SECRET) {
    logger.error(
      "❌ JWT_SECRET no está configurado. Configure la variable de entorno antes de iniciar.",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    logger.error(
      "❌ DATABASE_URL no está configurado. Configure la variable de entorno antes de iniciar.",
    );
    process.exit(1);
  }

  // CORS configurado por entorno
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, postman, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`❌ Origen bloqueado por CORS: ${origin}`);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  app.useStaticAssets(join(__dirname, "..", "uploads", "candidatos"), {
    prefix: "/uploads/candidatos/",
    index: false,
    dotfiles: "deny",
  });

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
    index: false,
    dotfiles: "deny",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Aplicar filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(new BigIntInterceptor());

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.url.includes("/candidates/") &&
      (req.method === "POST" || req.method === "PATCH")
    ) {
      req.setTimeout(30000);
    }
    next();
  });

  // Swagger dynamic documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Univote API")
    .setDescription(
      "Documentación dinámica de todos los endpoints del sistema Univote",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "bearerAuth",
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(3000);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(`📚 Swagger disponible en: ${await app.getUrl()}/docs`);
  logger.log(
    `📧 Servicio de contacto disponible en: ${await app.getUrl()}/contact`,
  );
  logger.log(
    `📁 Archivos estáticos servidos desde: ${join(__dirname, "..", "uploads")}`,
  );
  logger.log(`✅ JWT_SECRET configurado`);
  logger.log(`✅ Orígenes CORS permitidos: ${allowedOrigins.join(", ")}`);
}

bootstrap().catch((err) => {
  console.error("Error fatal al iniciar la aplicación:", err);
  process.exit(1);
});
