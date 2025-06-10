import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { PrismaClient } from "@prisma/client";
import { MulterFile } from "../interface/video.interface";
import { BasePredictionService } from "../prediction-base/base-prediction.service";
import { NotificationGateway } from "../notification.gateway";
import {
  ProcessingResponse,
  UploadResponse,
} from "../interface/processing.interface";

@Injectable()
export class FireDetectionService extends BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super(httpService, prisma);
  }

  predictVideo(file: MulterFile, userId: string): UploadResponse {
    this.notificationGateway.emitDetectionNotification(userId, "UPLOADED");

    void this.processVideoInBackground(file, userId);

    return {
      message: "Video uploaded successfully and is being processed",
      status: "PROCESSING",
    };
  }

  private async processVideoInBackground(
    file: MulterFile,
    userId: string,
  ): Promise<void> {
    try {
      const result = (await this.uploadToMLApi(
        file,
        userId,
        process.env.PREDICT_FIRE_API as string,
        "fire",
      )) as ProcessingResponse;

      this.notificationGateway.emitDetectionNotification(
        userId,
        "COMPLETED",
        result,
      );
    } catch {
      this.notificationGateway.emitDetectionNotification(userId, "ERROR");
    }
  }
}
