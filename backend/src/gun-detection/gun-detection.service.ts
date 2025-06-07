import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { PrismaClient, DetectionStatus } from "@prisma/client";
import {
  MulterFile,
  GunVideoPredictionResponse,
} from "src/interface/video.interface";
import { BasePredictionService } from "../prediction-base/base-prediction.service";

interface GunDetectionResult {
  overallStatus: DetectionStatus;
  overallConfidence: number;
  numberOfGuns: number;
  totalFrames: number;
}

@Injectable()
export class GunDetectionService extends BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient
  ) {
    super(httpService, prisma);
  }

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<GunVideoPredictionResponse> {
    const result = await this.uploadToMLApi(
      file,
      userId,
      process.env.PREDICT_GUN_API as string,
      "gun"
    );

    const detectionData = result as unknown as GunDetectionResult;

    return {
      videoUrl: result.videoUrl,
      overallStatus: detectionData.overallStatus as "GUN_DETECTED" | "NO_GUN",
      overallConfidence: detectionData.overallConfidence,
      numberOfGuns: detectionData.numberOfGuns,
      totalFrames: detectionData.totalFrames,
    };
  }
}
