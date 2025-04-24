import { Injectable } from '@nestjs/common';
import { FileType, PrismaClient } from '@prisma/client';
import { MulterFile, VideoDetectionResult } from './predict.controller';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpException } from '@nestjs/common';

interface VideoPredictionResponse {
  videoUrl: string;
  overallStatus: string;
  overallConfidence: number;
  violentFrames: number;
  totalFrames: number;
}
@Injectable()
export class PredictService {
  constructor(
    private readonly httpService: HttpService,
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
    createUploadRecord(userId: string, file: MulterFile, fileType: FileType) {
        return this.prisma.$transaction(async (prisma) => {
            // Create upload record
            const upload = await prisma.uploadsHistory.create({
                data: {
                    userId,
                    fileType,
                    fileSize: file.size,
                    processingStatus: 'PENDING',
                    uploadedAt: new Date(),
                }
            });

            // Update or create UserUploadStats
            await prisma.userUploadStats.upsert({
                where: { userId },
                update: {
                    totalUploads: { increment: 1 },
                    lastUploadDate: new Date(),
                },
                create: {
                    userId,
                    totalUploads: 1,
                    lastUploadDate: new Date(),
                }
            });

            return upload;
        });
    }

    async handleDetectionResults(
        uploadId: string, 
        detectionData: any
    ) {
        return this.prisma.$transaction(async (prisma) => {
            // Get the upload record to access userId
            const upload = await prisma.uploadsHistory.findUnique({
                where: { id: uploadId },
                select: { userId: true, duration: true }
            });

            if (!upload) {
                throw new Error('Upload record not found');
            }

            // Update upload record
            const updatedUpload = await prisma.uploadsHistory.update({
                where: { id: uploadId },
                data: {
                    processingStatus: 'COMPLETED',
                    detectionStatus: detectionData.overallStatus,
                    overallConfidence: detectionData.overallConfidence,
                },
                include: {
                    detectionResults: true
                }
            });

            // Update UserUploadStats
            await prisma.userUploadStats.update({
                where: { userId: upload.userId },
                data: {
                    lastDetectionStatus: detectionData.overallStatus,
                    averageDuration: {
                        set: upload.duration || 0
                    }
                }
            });

            return updatedUpload;
        });
    }

    async predictVideo(
        file: MulterFile,
        userId: string,
      ): Promise<VideoPredictionResponse> {
        const uploadRecord = await this.createUploadRecord(userId, file, 'VIDEO');
    
        try {
          const formData = new FormData();
          const apiUrl = process.env.PREDICT_VIDEO_API as string;
    
          formData.append('file', new Blob([file.buffer]), file.originalname);
    
          const response = await firstValueFrom(
            this.httpService.post(apiUrl, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              responseType: 'arraybuffer',
            }),
          );
    
          const detectionData: VideoDetectionResult = JSON.parse(
            response.headers['x-detection-results'] as string,
          ) as VideoDetectionResult;
    
          const updatedUpload = await this.handleDetectionResults(
            uploadRecord.id,
            detectionData,
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
                data: { processingStatus: 'FAILED' },
            });

            console.error('Prediction error:', e);
            throw new HttpException(
                e.message || 'Error during prediction',
                e.status || 500
            );
        }
      }    
}
