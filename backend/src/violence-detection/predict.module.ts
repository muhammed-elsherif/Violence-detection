// src/predict/predict.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PredictController } from './predict.controller';
import { PredictService } from './predict.service';
import { PrismaClient } from '@prisma/client';
import { PrismaSqlModule } from 'src/prisma-sql/prisma-sql.module';
// import { RedisModule } from 'src/redis/redis.module';
// import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [HttpModule, PrismaSqlModule],
  controllers: [PredictController],
  providers: [PredictService, PrismaClient]
})
export class PredictModule {}
