import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import * as FormData from "form-data";
import { MulterFile } from "../interface/video.interface";
import { createReadStream } from "fs";
import { PrismaClient, DetectionStatus } from "@prisma/client";

export type FileType = "VIDEO" | "IMAGE";

export interface VideoDetectionResult {
  totalFrames: number;
  violentFrames: number;
  overallStatus: DetectionStatus;
  overallConfidence: number;
  // Add other properties as needed
}

@Injectable()
export abstract class BasePredictionService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly prisma: PrismaClient
  ) {}

  protected async uploadToMLApi(
    file: MulterFile,
    userId: string,
    endpoint: string,
    modelType: string
  ) {
    const uploadRecord = await this.createUploadRecord(userId, file, "VIDEO");

    const formData = new FormData();

    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(endpoint, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
        })
      );

      const detectionData: VideoDetectionResult = JSON.parse(
        response.headers["x-detection-results"] as string
      ) as VideoDetectionResult;

      const updatedUpload = await this.handleDetectionResults(
        uploadRecord.id,
        detectionData
      );

      return {
        videoUrl: `/predict/video/${updatedUpload.id}`,
        overallStatus: detectionData.overallStatus,
        overallConfidence: detectionData.overallConfidence ?? 0,
        violentFrames: detectionData.violentFrames ?? 0,
        totalFrames: detectionData.totalFrames ?? 0,
        // videoUrl: response.headers["x-video-url"] as string,
      };
    } catch (error) {
      await this.prisma.uploadsHistory.update({
        where: { id: uploadRecord.id },
        data: { processingStatus: "FAILED" },
      });
      throw new HttpException(
        error.message ||
          `Error during ${modelType} prediction: ${error.message}`,
        error.status || 500
      );
    }
  }

  async getVideoStream(videoId: string) {
    try {
      const videoPath = `${process.env.VIDEO_OUTPUT_DIR}/${videoId}.mp4`;
      return createReadStream(videoPath);
    } catch (error) {
      throw new Error(`Error retrieving video: ${error.message}`);
    }
  }

  createUploadRecord(userId: string, file: MulterFile, fileType: FileType) {
    return this.prisma.$transaction(async (prisma) => {
      const upload = await prisma.uploadsHistory.create({
        data: {
          userId,
          fileType,
          fileSize: file.size,
          processingStatus: "PENDING",
          uploadedAt: new Date(),
        },
      });

      // Update or create UserUploadStats
      await prisma.userStats.upsert({
        where: { userId },
        update: {
          totalUploads: { increment: 1 },
          lastUploadDate: new Date(),
        },
        create: {
          userId,
          totalUploads: 1,
          lastUploadDate: new Date(),
        },
      });

      return upload;
    });
  }

  async handleDetectionResults(
    uploadId: string,
    detectionData: VideoDetectionResult
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Get the upload record to access userId
      const upload = await prisma.uploadsHistory.findUnique({
        where: { id: uploadId },
        select: { userId: true, duration: true },
      });

      if (!upload) {
        throw new Error("Upload record not found");
      }

      const updatedUpload = await prisma.uploadsHistory.update({
        where: { id: uploadId },
        data: {
          processingStatus: "COMPLETED",
          detectionStatus: detectionData.overallStatus as DetectionStatus,
          overallConfidence: detectionData.overallConfidence,
        },
        include: {
          detectionResults: true,
        },
      });

      await prisma.userStats.update({
        where: { userId: upload.userId },
        data: {
          lastDetectionStatus: detectionData.overallStatus as DetectionStatus,
          averageDuration: {
            set: upload.duration || 0,
          },
        },
      });

      return updatedUpload;
    });
  }
}
