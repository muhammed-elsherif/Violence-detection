import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { PrismaClient } from "@prisma/client";
import {
  MulterFile,
  CrashVideoPredictionResponse,
} from "../interface/video.interface";
import { BasePredictionService } from "../violence-detection/base-prediction.service";

@Injectable()
export class CrashDetectionService extends BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient
  ) {
    super(httpService, prisma);
  }

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<CrashVideoPredictionResponse> {
    const result = await this.uploadToMLApi(
      file,
      userId,
      process.env.CRASH_DETECTION_API as string,
      "crash"
    );

    return {
      videoUrl: result.videoUrl,
      overallStatus: result.overallStatus as "CRASH_DETECTED" | "NO_CRASH",
      overallConfidence: result.overallConfidence,
      totalFrames: result.totalFrames,
    };
  }
}
