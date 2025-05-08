import { Controller, Post, Body } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { AlertsGateway } from "./alerts.gateway";

@Controller("alerts")
export class AlertsController {
  constructor(
    private readonly alertsGateway: AlertsGateway,
    private readonly alertsService: AlertsService
  ) {}

  @Post("fire")
  async handleFireAlert(@Body() data: any) {
    // await Promise.all([
    //     this.alertsService.sendEmailAlert({ image, location }),
    //     this.alertsService.callEmergencyService(location),
    //     this.alertsService.logAlertToDatabase(image, location),
    //   ]);
    this.alertsGateway.sendFireAlert(data);
    await this.alertsService.sendEmailAlert(data, "fire");
    return { status: "Alert broadcasted and email sent" };
  }

  @Post("gun")
  async handleGunAlert(@Body() body: any) {
    this.alertsGateway.sendFireAlert(body);
    await this.alertsService.sendEmailAlert(body, "gun");
    return { status: "Alert broadcasted and email sent" };
  }
}
