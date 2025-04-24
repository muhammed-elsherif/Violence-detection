"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const common_2 = require("@nestjs/common");
let PredictService = class PredictService {
    constructor(httpService, prisma) {
        this.httpService = httpService;
        this.prisma = prisma;
    }
    createUploadRecord(userId, file, fileType) {
        return this.prisma.uploadsHistory.create({
            data: {
                userId,
                fileType,
                fileSize: file.size,
                processingStatus: 'PENDING',
                detectionResults: {
                    create: []
                }
            },
            include: {
                detectionResults: true
            }
        });
    }
    async handleDetectionResults(uploadId, detectionData) {
        return this.prisma.uploadsHistory.update({
            where: { id: uploadId },
            data: {
                processingStatus: 'COMPLETED',
                detectionStatus: detectionData.overallStatus,
                overallConfidence: detectionData.overallConfidence,
                detectionResults: {
                    createMany: {
                        data: detectionData.results.map(result => ({
                            confidence: result.confidence,
                            label: result.label,
                            severity: result.severity,
                            timestamp: result.timestamp
                        }))
                    }
                }
            },
            include: {
                detectionResults: true
            }
        });
    }
    async predictVideo(file, userId) {
        const uploadRecord = await this.createUploadRecord(userId, file, 'VIDEO');
        try {
            const formData = new FormData();
            const apiUrl = process.env.PREDICT_VIDEO_API;
            formData.append('file', new Blob([file.buffer]), file.originalname);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'arraybuffer',
            }));
            const detectionData = JSON.parse(response.headers['x-detection-results']);
            const updatedUpload = await this.handleDetectionResults(uploadRecord.id, detectionData);
            return {
                videoUrl: `/predict/video/${updatedUpload.id}`,
                overallStatus: detectionData.overallStatus,
                overallConfidence: detectionData.overallConfidence ?? 0,
                violentFrames: detectionData.violentFrames ?? 0,
                totalFrames: detectionData.totalFrames ?? 0,
            };
        }
        catch (e) {
            await this.prisma.uploadsHistory.update({
                where: { id: uploadRecord.id },
                data: { processingStatus: 'FAILED' },
            });
            throw new common_2.HttpException('Error during prediction', 500);
        }
    }
};
exports.PredictService = PredictService;
exports.PredictService = PredictService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        client_1.PrismaClient])
], PredictService);
//# sourceMappingURL=predict.service.js.map