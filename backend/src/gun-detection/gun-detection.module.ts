/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { GunDetectionService } from "./gun-detection.service";
import { GunDetectionController } from "./gun-detection.controller";

@Module({
  controllers: [GunDetectionController],
  providers: [GunDetectionService],
})
export class GunDetectionModule {}
