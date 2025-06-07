import { Module } from '@nestjs/common';
import { FireDetectionService } from './fire-detection.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [HttpModule],
  providers: [FireDetectionService, PrismaClient],
})
export class FireDetectionModule {}
