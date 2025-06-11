import { Module } from "@nestjs/common";
import { FireDetectionService } from "./fire-detection.service";
import { HttpModule } from "@nestjs/axios";
import { PrismaClient } from "@prisma/client";
import { NotificationModule } from "../notification.module";

@Module({
  imports: [HttpModule, NotificationModule],
  providers: [FireDetectionService, PrismaClient],
  exports: [FireDetectionService],
})
export class FireDetectionModule {}
