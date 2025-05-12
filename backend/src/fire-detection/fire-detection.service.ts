import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaClient } from '@prisma/client';
import { PrismaSqlService, MulterFile, FireVideoPredictionResponse } from '../prisma-sql/prisma-sql.service';
import * as FormData from "form-data";

interface FireDetectionResult {
    overallStatus: "FIRE_DETECTED" | "NO_FIRE";
    overallConfidence: number;
    totalFrames: number;
  }
  
@Injectable()
export class FireDetectionService { constructor(
    private readonly httpService: HttpService,
    private readonly prismaSqlService: PrismaSqlService,
    private prisma: PrismaClient
  ) {}

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<FireVideoPredictionResponse> {
    const uploadRecord = await this.prismaSqlService.createUploadRecord(
      userId,
      file,
      "VIDEO"
    );

    try {
      const formData = new FormData();
      const apiUrl = process.env.PREDICT_FIRE_API as string;

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

      const detectionData: FireDetectionResult = JSON.parse(
        response.headers["x-detection-results"] as string
      ) as FireDetectionResult;

      const updatedUpload = await this.prismaSqlService.handleDetectionResults(
        uploadRecord.id,
        detectionData
      );

      return {
        videoUrl: `/fire-detection/video/${updatedUpload.id}`,
        overallStatus: detectionData.overallStatus,
        overallConfidence: detectionData.overallConfidence ?? 0,
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
