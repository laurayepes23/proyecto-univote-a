import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './interceptors/bigint.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads', 'candidatos'), {
    prefix: '/uploads/candidatos/',
    index: false,
    dotfiles: 'deny',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    index: false,
    dotfiles: 'deny',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.useGlobalInterceptors(new BigIntInterceptor());

  app.use((req, res, next) => {
    if (req.url.includes('/candidates/') && (req.method === 'POST' || req.method === 'PATCH')) {
      req.setTimeout(30000);
    }
    next();
  });

  await app.listen(3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📧 Servicio de contacto disponible en: ${await app.getUrl()}/contact`);
  console.log(`📁 Archivos estáticos servidos desde: ${join(__dirname, '..', 'uploads')}`);
}

bootstrap();