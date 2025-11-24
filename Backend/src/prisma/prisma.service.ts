import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    if (process.env.NODE_ENV === "test") {
      return; // evita conexión real en entorno de pruebas si no hay DB
    }
    await this.$connect();
  }

  constructor() {
    super({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            "postgresql://user:password@localhost:5432/univote?schema=public",
        },
      },
    });
  }

  async onModuleDestroy() {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    await this.$disconnect();
  }
}
