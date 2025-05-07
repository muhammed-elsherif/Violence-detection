import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { VideoDetectionResult } from "./predict.controller";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { HttpException } from "@nestjs/common";
import * as FormData from "form-data";
import {
  MulterFile,
  PrismaSqlService,
  ViolenceVideoPredictionResponse,
} from "../prisma-sql/prisma-sql.service";

@Injectable()
export class PredictService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaSqlService: PrismaSqlService,
    private prisma: PrismaClient
  ) {}

  //   async analyzeImage(fileBuffer: Buffer): Promise<any> {
  //     const formData = new FormData();
  //     formData.append('file', new Blob([fileBuffer]), 'frame.jpg');

  //     const response = await firstValueFrom(
  //       this.httpService.post('http://localhost:5000/predict', formData, {
  //         headers: formData.getHeaders ? formData.getHeaders() : {}, // adjust if needed
  //       })
  //     );
  //     return response.data;
  //   }

  async predictVideo(
    file: MulterFile,
    userId: string
  ): Promise<ViolenceVideoPredictionResponse> {
    const uploadRecord = await this.prismaSqlService.createUploadRecord(
      userId,
      file,
      "VIDEO"
    );

    try {
      const formData = new FormData();
      const apiUrl = process.env.PREDICT_VIDEO_API as string;

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

      const detectionData: VideoDetectionResult = JSON.parse(
        response.headers["x-detection-results"] as string
      ) as VideoDetectionResult;

      const updatedUpload = await this.prismaSqlService.handleDetectionResults(
        uploadRecord.id,
        detectionData
      );

      return {
        videoUrl: `/predict/video/${updatedUpload.id}`,
        overallStatus: detectionData.overallStatus,
        overallConfidence: detectionData.overallConfidence ?? 0,
        violentFrames: detectionData.violentFrames ?? 0,
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
