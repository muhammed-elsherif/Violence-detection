/* eslint-disable prettier/prettier */
import { Controller, Get } from "@nestjs/common";
import { LiveViolenceService } from "./live-violence.service";

@Controller("live-violence-detection")
export class LiveViolenceController {
  constructor(private readonly liveViolenceService: LiveViolenceService) {}

  @Get("detect")
  getLiveViolenceDetection() {
    return this.liveViolenceService.getLiveViolenceDetection();
  }
}
