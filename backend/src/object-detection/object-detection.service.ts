import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { FileType, PrismaClient } from "@prisma/client";
import * as FormData from "form-data";
import { firstValueFrom } from "rxjs";
import {
  MulterFile,
  PrismaSqlService,
  ObjectVideoPredictionResponse,
} from "../prisma-sql/prisma-sql.service";

export interface VideoDetectionResult {
  overallStatus: "VIOLENCE_DETECTED" | "NON_VIOLENCE";
  uniqueObjects: string[];
  totalFrames: number;
}
@Injectable()
export class ObjectDetectionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaSqlService: PrismaSqlService,
    private prisma: PrismaClient
  ) {}

  async detectObjectsInVideo(
    file: MulterFile,
    userId: string
  ): Promise<ObjectVideoPredictionResponse> {
    const uploadRecord = await this.prismaSqlService.createUploadRecord(
      userId,
      file,
      "VIDEO"
    );

    try {
      // Prepare the form data to send to the machine learning API
      const formData = new FormData();
      const apiUrl = process.env.PREDICT_OBJECT_API as string;

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

      // const detectedLabels = detectionData.detectedLabels.map((label) => ({
      //   label: label.name,
      //   confidence: label.confidence ?? 0,
      // }));

      const updatedUpload = await this.prismaSqlService.handleDetectionResults(
        uploadRecord.id,
        detectionData
      );

      return {
        videoUrl: `/predict/video/${updatedUpload.id}`,
        totalFrames: detectionData.totalFrames ?? 0,
        uniqueObjects: detectionData.uniqueObjects,
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
