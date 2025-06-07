import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { PrismaClient, DetectionStatus } from "@prisma/client";
import {
  MulterFile,
  FireVideoPredictionResponse,
} from "../interface/video.interface";
import { BasePredictionService } from "../prediction-base/base-prediction.service";

@Injectable()
export class FireDetectionService extends BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient
  ) {
    super(httpService, prisma);
  }

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<FireVideoPredictionResponse> {
    const result = await this.uploadToMLApi(
      file,
      userId,
      process.env.PREDICT_FIRE_API as string,
      "fire"
    );

    return {
      videoUrl: result.videoUrl,
      overallStatus: result.overallStatus as "FIRE_DETECTED" | "NO_FIRE",
      overallConfidence: result.overallConfidence,
      totalFrames: result.totalFrames,
    };
  }
}
