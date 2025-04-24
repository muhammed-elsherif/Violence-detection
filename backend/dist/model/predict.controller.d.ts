import { HttpService } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { PredictService } from './predict.service';
export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export interface VideoDetectionResult {
    overallStatus: 'VIOLENCE_DETECTED' | 'NON_VIOLENCE';
    overallConfidence: number;
    violentFrames?: number;
    totalFrames?: number;
}
interface VideoPredictionResponse {
    videoUrl: string;
    overallStatus: string;
    overallConfidence: number;
    violentFrames: number;
    totalFrames: number;
}
interface ImagePredictionResponse {
    contentType: string;
    contentDisposition: string;
    data: Buffer;
}
export declare class PredictController {
    private readonly httpService;
    private readonly predictService;
    private prisma;
    constructor(httpService: HttpService, predictService: PredictService, prisma: PrismaClient);
    predictVideo(file: MulterFile, req: {
        user: {
            sub: string;
        };
    }): Promise<VideoPredictionResponse>;
    getAnnotatedVideo(id: string): Promise<{
        filePath: string;
    }>;
    predictImage(file: MulterFile): Promise<ImagePredictionResponse>;
}
export {};
