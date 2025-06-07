/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ObjectDetectionService } from "./object-detection.service";
import { HttpModule } from "@nestjs/axios";
import { PrismaClient } from "@prisma/client";

@Module({
  imports: [HttpModule],
  providers: [ObjectDetectionService, PrismaClient],
})
export class ObjectDetectionModule {}
