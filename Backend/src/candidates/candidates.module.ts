import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageProcessorService } from './image-processor.service';
import { NotificationsModule } from '../notications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CandidatesController],
  providers: [CandidatesService, ImageProcessorService],
})
export class CandidatesModule {}