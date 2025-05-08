import { Module } from "@nestjs/common";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";
import { AlertsGateway } from "./alerts.gateway";
import { PrismaClient } from "@prisma/client";
import { MailService } from "src/mail/mail.service";

@Module({
  imports: [],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsGateway, PrismaClient, MailService],
})
export class AlertsModule {}
