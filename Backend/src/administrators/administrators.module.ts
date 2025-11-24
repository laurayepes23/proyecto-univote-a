import { Module } from "@nestjs/common";

import { AdministratorsController } from "./administrators.controller";
import { AdministratorsService } from "./administrators.servicie";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AdministratorsController],
  providers: [AdministratorsService],
})
export class AdministratorsModule {}
