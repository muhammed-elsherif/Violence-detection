import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import {
  MulterFile,
  ObjectVideoPredictionResponse,
} from "../interface/video.interface";
import { BasePredictionService } from "../violence-detection/base-prediction.service";

export interface VideoDetectionResult {
  uniqueObjects: string[];
  totalFrames: number;
  detectedLabels?: { label: string; confidence: number }[];
}

@Injectable()
export class ObjectDetectionService extends BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient
  ) {
    super(httpService, prisma);
  }

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<ObjectVideoPredictionResponse> {
    const result = await this.uploadToMLApi(
      file,
      userId,
      process.env.PREDICT_OBJECT_API as string,
      "object"
    );

    const detectionData = result as unknown as VideoDetectionResult;

    return {
      videoUrl: result.videoUrl,
      totalFrames: detectionData.totalFrames,
      uniqueObjects: detectionData.uniqueObjects || [],
      detectedLabels: detectionData.detectedLabels,
    };
  }
}
