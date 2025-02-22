import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
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
export declare class PredictController {
    private readonly httpService;
    private readonly predictService;
    private prisma;
    constructor(httpService: HttpService, predictService: PredictService, prisma: PrismaClient);
    predictVideo(file: MulterFile, res: Response, userId: string): Promise<void>;
    predictImage(file: MulterFile, res: Response): Promise<void>;
}
