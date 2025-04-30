/* eslint-disable prettier/prettier */
import { Controller, Get } from "@nestjs/common";
import { ObjectDetectionService } from "./object-detection.service";

@Controller("object-detection")
export class ObjectDetectionController {
  constructor(private readonly objectDetectionService: ObjectDetectionService) {}

  @Get("detect")
  getObjectDetection() {
    return this.objectDetectionService.getObjectDetection();
  }
}
