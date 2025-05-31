import { Module } from '@nestjs/common';
import { FireDetectionService } from './fire-detection.service';
import { FireDetectionController } from './fire-detection.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [HttpModule],
  controllers: [FireDetectionController],
  providers: [FireDetectionService, PrismaClient],
})
export class FireDetectionModule {}
