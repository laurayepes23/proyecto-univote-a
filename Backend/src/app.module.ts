import { VotesModule } from './votes/votes.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { VotersModule } from './voters/voters.module';
import { AdministratorsModule } from './administrators/administrators.module';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatesModule } from './candidates/candidates.module';
import { ElectionsModule } from './elections/elections.module';
import { RolesModule } from './role/role.module';
import { CareersModule } from './careers/careers.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ResultsModule } from './results/results.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        JWT_SECRET: Joi.string().min(32).required(),
        CORS_ORIGIN: Joi.string().uri().default('http://localhost:5173'),
        JWT_EXPIRATION_ADMIN: Joi.string().optional(),
        JWT_EXPIRATION_VOTER: Joi.string().optional(),
        JWT_EXPIRATION_CANDIDATE: Joi.string().optional(),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'global',
          ttl: 60_000,
          limit: 100,
        },
        {
          name: 'login',
          ttl: 60_000,
          limit: 5,
        },
      ],
    }),
    AuthModule,
    VotersModule,
    AdministratorsModule,
    PrismaModule,
    CandidatesModule,
    VotesModule,
    ElectionsModule,
    RolesModule,
    CareersModule,
    ProposalsModule,
    ResultsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule {}
