import { Module } from '@nestjs/common';
import { UserStatsController } from './user-stats.controller';
import { UserStatsService } from './user-stats.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [UserStatsController],
  providers: [UserStatsService, PrismaClient],
})
export class UserStatsModule {}
