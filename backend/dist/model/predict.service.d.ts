import { FileType, PrismaClient } from '@prisma/client';
import { MulterFile } from './predict.controller';
export declare class PredictService {
    private prisma;
    constructor(prisma: PrismaClient);
    createUploadRecord(userId: string, file: MulterFile, fileType: FileType): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        filePath: string;
        fileType: import(".prisma/client").$Enums.FileType;
        processingStatus: import(".prisma/client").$Enums.ProcessingStatus;
        detectionStatus: import(".prisma/client").$Enums.DetectionStatus | null;
        overallConfidence: number | null;
        duration: number | null;
        dimensions: string | null;
        fileSize: number;
        originalFilePath: string | null;
        annotatedFilePath: string | null;
        mimeType: string | null;
    }>;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        filePath: string;
        fileType: import(".prisma/client").$Enums.FileType;
        processingStatus: import(".prisma/client").$Enums.ProcessingStatus;
        detectionStatus: import(".prisma/client").$Enums.DetectionStatus | null;
        overallConfidence: number | null;
        duration: number | null;
        dimensions: string | null;
        fileSize: number;
        originalFilePath: string | null;
        annotatedFilePath: string | null;
        mimeType: string | null;
    }>;
}
