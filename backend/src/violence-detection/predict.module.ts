// src/predict/predict.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PredictController } from "./predict.controller";
import { PredictService } from "./predict.service";
import { GunDetectionService } from "../gun-detection/gun-detection.service";
import { FireDetectionService } from "../fire-detection/fire-detection.service";
import { CrashDetectionService } from "../crash-detection/crash-detection.service";
import { ObjectDetectionService } from "../object-detection/object-detection.service";
import { PrismaClient } from "@prisma/client";
// import { RedisModule } from 'src/redis/redis.module';
// import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [HttpModule],
  controllers: [PredictController],
  providers: [
    PredictService,
    GunDetectionService,
    FireDetectionService,
    CrashDetectionService,
    ObjectDetectionService,
    PrismaClient,
  ],
  exports: [
    PredictService,
    GunDetectionService,
    FireDetectionService,
    CrashDetectionService,
    ObjectDetectionService,
  ],
})
export class PredictModule {}
