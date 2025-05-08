import { Module } from "@nestjs/common";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";
import { AlertsGateway } from "./alerts.gateway";
import { PrismaClient } from "@prisma/client";

@Module({
  imports: [],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsGateway, PrismaClient],
})
export class AlertsModule {}
