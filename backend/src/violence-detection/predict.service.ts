import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { PrismaClient } from "@prisma/client";
import {
  MulterFile,
  ViolenceVideoPredictionResponse,
} from "../interface/video.interface";
import { BasePredictionService } from "./base-prediction.service";

@Injectable()
export class PredictService extends BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient
  ) {
    super(httpService, prisma);
  }

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<ViolenceVideoPredictionResponse> {
    const apiUrl = process.env.PREDICT_VIOLENCE_API as string;
    const result = await this.uploadToMLApi(file, userId, apiUrl, "VIOLENCE");

    return {
      videoUrl: result.videoUrl,
      overallStatus: result.overallStatus as
        | "VIOLENCE_DETECTED"
        | "NON_VIOLENCE",
      overallConfidence: result.overallConfidence,
      violentFrames: result.violentFrames,
      totalFrames: result.totalFrames,
    };
  }

  async predictImage(file: MulterFile, userId: string) {
    const apiUrl = process.env.PREDICT_IMAGE_API as string;
    return await this.uploadToMLApi(file, userId, apiUrl, "IMAGE");
  }
}
