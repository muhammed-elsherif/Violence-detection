/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ObjectDetectionService } from "./object-detection.service";
import { ObjectDetectionController } from "./object-detection.controller";
import { PrismaSqlModule } from "src/prisma-sql/prisma-sql.module";
import { HttpModule } from "@nestjs/axios";
import { PrismaClient } from "@prisma/client";

@Module({
  imports: [HttpModule, PrismaSqlModule],
  controllers: [ObjectDetectionController],
  providers: [ObjectDetectionService, PrismaClient],
})
export class ObjectDetectionModule {}
