import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { FileType, PrismaClient } from "@prisma/client";
import * as FormData from "form-data";
import { firstValueFrom } from "rxjs";
import {
  MulterFile,
  PrismaSqlService,
  GunVideoPredictionResponse,
} from "src/prisma-sql/prisma-sql.service";

interface GunDetectionResult {
  overallStatus: "GUN_DETECTED" | "NO_GUN";
  overallConfidence: number;
  numberOfGuns: number;
  totalFrames: number;
}

@Injectable()
export class GunDetectionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaSqlService: PrismaSqlService,
    private prisma: PrismaClient
  ) {}

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<GunVideoPredictionResponse> {
    const uploadRecord = await this.prismaSqlService.createUploadRecord(
      userId,
      file,
      "VIDEO"
    );

    try {
      const formData = new FormData();
      const apiUrl = process.env.PREDICT_GUN_API as string;

      formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(apiUrl, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
        })
      );

      const detectionData: GunDetectionResult = JSON.parse(
        response.headers["x-detection-results"] as string
      ) as GunDetectionResult;

      const updatedUpload = await this.prismaSqlService.handleDetectionResults(
        uploadRecord.id,
        detectionData
      );

      return {
        videoUrl: `/gun-detection/video/${updatedUpload.id}`,
        overallStatus: detectionData.overallStatus,
        overallConfidence: detectionData.overallConfidence ?? 0,
        numberOfGuns: detectionData.numberOfGuns ?? 0,
        totalFrames: detectionData.totalFrames ?? 0,
      };
    } catch (e) {
      await this.prisma.uploadsHistory.update({
        where: { id: uploadRecord.id },
        data: { processingStatus: "FAILED" },
      });

      console.error("Prediction error:", e);
      throw new HttpException(
        e.message || "Error during prediction",
        e.status || 500
      );
    }
  }
}
