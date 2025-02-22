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
let PredictService = class PredictService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUploadRecord(userId, file, fileType) {
        return this.prisma.upload.create({
            data: {
                userId,
                filePath: '',
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
        return this.prisma.upload.update({
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
};
exports.PredictService = PredictService;
exports.PredictService = PredictService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], PredictService);
//# sourceMappingURL=predict.service.js.map