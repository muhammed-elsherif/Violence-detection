/* eslint-disable prettier/prettier */
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { GunDetectionService } from "./gun-detection.service";
import { PrismaClient } from "@prisma/client";

@Module({
  imports: [HttpModule],
  providers: [GunDetectionService, PrismaClient],
})
export class GunDetectionModule { }