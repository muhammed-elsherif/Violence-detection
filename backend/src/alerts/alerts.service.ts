import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { MailService } from "src/mail/mail.service";
@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService
  ) {}

  async sendEmailAlert(body: any, type: string) {
    await this.mailService.sendEmailAlert(body, type);
  }

  async logAlertToDatabase(image: string, location: any) {
    await this.prisma.alert.create({
      data: {
        image,
        lat: location.lat,
        lng: location.lng,
      },
    });
  }
}
