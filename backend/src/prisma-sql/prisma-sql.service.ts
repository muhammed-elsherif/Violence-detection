import { Injectable } from "@nestjs/common";
import { FileType, PrismaClient } from "@prisma/client";

// Define a custom interface for the uploaded file.
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ViolenceVideoPredictionResponse {
  videoUrl: string;
  totalFrames: number;
  overallStatus: string;
  overallConfidence: number;
  violentFrames?: number;
}

export interface GunVideoPredictionResponse {
  videoUrl: string;
  overallStatus: string;
  overallConfidence: number;
  numberOfGuns: number;
  totalFrames: number;
}

export interface ObjectVideoPredictionResponse {
  videoUrl: string;
  totalFrames: number;
  uniqueObjects: string[];
  detectedLabels?: { label: string; confidence: number }[];
}

export interface FireVideoPredictionResponse {
  videoUrl: string;
  totalFrames: number;
  overallStatus: string;
  overallConfidence: number;
}
@Injectable()
export class PrismaSqlService {
  constructor(private prisma: PrismaClient) {}

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

  async handleDetectionResults(uploadId: string, detectionData: any) {
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
          detectionStatus: detectionData.overallStatus,
          overallConfidence: detectionData.overallConfidence,
        },
        include: {
          detectionResults: true,
        },
      });

      await prisma.userStats.update({
        where: { userId: upload.userId },
        data: {
          lastDetectionStatus: detectionData.overallStatus,
          averageDuration: {
            set: upload.duration || 0,
          },
        },
      });

      return updatedUpload;
    });
  }
}
