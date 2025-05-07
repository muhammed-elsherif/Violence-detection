/* eslint-disable prettier/prettier */
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { GunDetectionController } from "./gun-detection.controller";
import { GunDetectionService } from "./gun-detection.service";
import { PrismaClient } from "@prisma/client";
import { PrismaSqlModule } from "src/prisma-sql/prisma-sql.module";

@Module({
  imports: [HttpModule, PrismaSqlModule],
  controllers: [GunDetectionController],
  providers: [GunDetectionService, PrismaClient],
})
export class GunDetectionModule { }