import { FileType, PrismaClient } from '@prisma/client';
import { MulterFile } from './predict.controller';
import { HttpService } from '@nestjs/axios';
interface VideoPredictionResponse {
    videoUrl: string;
    overallStatus: string;
    overallConfidence: number;
    violentFrames: number;
    totalFrames: number;
}
export declare class PredictService {
    private readonly httpService;
    private prisma;
    constructor(httpService: HttpService, prisma: PrismaClient);
    createUploadRecord(userId: string, file: MulterFile, fileType: FileType): import(".prisma/client").Prisma.Prisma__UploadsHistoryClient<{
        detectionResults: {
            id: string;
            createdAt: Date;
            timestamp: number | null;
            confidence: number;
            label: string | null;
            severity: number | null;
            uploadId: string;
        }[];
    } & {
        id: string;
        userId: string;
        fileType: import(".prisma/client").$Enums.FileType;
        processingStatus: import(".prisma/client").$Enums.ProcessingStatus;
        detectionStatus: import(".prisma/client").$Enums.DetectionStatus | null;
        overallConfidence: number | null;
        duration: number | null;
        fileSize: number;
        uploadedAt: Date;
        annotatedFilePath: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    handleDetectionResults(uploadId: string, detectionData: any): Promise<{
        detectionResults: {
            id: string;
            createdAt: Date;
            timestamp: number | null;
            confidence: number;
            label: string | null;
            severity: number | null;
            uploadId: string;
        }[];
    } & {
        id: string;
        userId: string;
        fileType: import(".prisma/client").$Enums.FileType;
        processingStatus: import(".prisma/client").$Enums.ProcessingStatus;
        detectionStatus: import(".prisma/client").$Enums.DetectionStatus | null;
        overallConfidence: number | null;
        duration: number | null;
        fileSize: number;
        uploadedAt: Date;
        annotatedFilePath: string | null;
    }>;
    predictVideo(file: MulterFile, userId: string): Promise<VideoPredictionResponse>;
}
export {};
