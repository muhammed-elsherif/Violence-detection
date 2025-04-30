/* eslint-disable prettier/prettier */
import { Controller, Get } from "@nestjs/common";
import { GunDetectionService } from "./gun-detection.service";

@Controller("gun-detection")
export class GunDetectionController {
  constructor(private readonly gunDetectionService: GunDetectionService) {}

  @Get("detect")
  getGunDetection() {
    return this.gunDetectionService.getGunDetection();
  }
}
