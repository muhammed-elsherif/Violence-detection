/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { FileType, PrismaClient } from '@prisma/client';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { MulterFile } from '../model/predict.controller';

interface GunDetectionResult {
    overallStatus: 'GUN_DETECTED' | 'NO_GUN';
    overallConfidence: number;
    numberOfGuns: number;
}

interface VideoPredictionResponse {
    videoUrl: string;
    overallStatus: string;
    overallConfidence: number;
    numberOfGuns: number;
}

@Injectable()
export class GunDetectionService  {
    constructor(
        private readonly httpService: HttpService,
        private prisma: PrismaClient
    ) { }

    // Record video upload details
    async createUploadRecord(userId: string, file: MulterFile, fileType: FileType) {
        return this.prisma.$transaction(async (prisma) => {
            const upload = await prisma.uploadsHistory.create({
                data: {
                    userId,
                    fileType,
                    fileSize: file.size,
                    processingStatus: 'PENDING',
                    uploadedAt: new Date(),
                },
            });

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
                },
            });

            return upload;
        });
    }

    // Handle the result of gun detection
    async handleDetectionResults(uploadId: string, detectionData: GunDetectionResult) {
        return this.prisma.$transaction(async (prisma) => {
            const upload = await prisma.uploadsHistory.findUnique({
                where: { id: uploadId },
                select: { userId: true, duration: true },
            });

            if (!upload) {
                throw new Error('Upload record not found');
            }

            const updatedUpload = await prisma.uploadsHistory.update({
                where: { id: uploadId },
                data: {
                    processingStatus: 'COMPLETED',
                    detectionStatus: detectionData.overallStatus,
                    overallConfidence: detectionData.overallConfidence,
                },
                include: {
                    detectionResults: true,
                },
            });

            await prisma.userUploadStats.update({
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

    // Predict guns in the video
    async predictVideo(file: MulterFile, userId: string): Promise<VideoPredictionResponse> {
        const uploadRecord = await this.createUploadRecord(userId, file, 'VIDEO');

        try {
            const formData = new FormData();
            const apiUrl = process.env.PREDICT_GUN_API as string;

            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            const response = await firstValueFrom(
                this.httpService.post(apiUrl, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                    responseType: 'arraybuffer',
                })
            );

            const detectionData: GunDetectionResult = JSON.parse(
                response.headers['x-detection-results'] as string
            ) as GunDetectionResult;

            const updatedUpload = await this.handleDetectionResults(uploadRecord.id, detectionData);

            return {
                videoUrl: `/gun-detection/video/${updatedUpload.id}`,
                overallStatus: detectionData.overallStatus,
                overallConfidence: detectionData.overallConfidence ?? 0,
                numberOfGuns: detectionData.numberOfGuns ?? 0,
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
