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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const axios_1 = require("@nestjs/axios");
const FormData = require("form-data");
const rxjs_1 = require("rxjs");
const client_1 = require("@prisma/client");
const predict_service_1 = require("./predict.service");
let PredictController = class PredictController {
    constructor(httpService, predictService, prisma) {
        this.httpService = httpService;
        this.predictService = predictService;
        this.prisma = prisma;
    }
    async predictVideo(file, res, userId) {
        const uploadRecord = await this.predictService.createUploadRecord(userId, file, 'VIDEO');
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, file.originalname);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://localhost:8000/predict_video', formData, {
                headers: formData.getHeaders(),
                responseType: 'arraybuffer',
            }));
            const detectionData = JSON.parse(response.headers['x-detection-results']);
            const updatedUpload = await this.predictService.handleDetectionResults(uploadRecord.id, detectionData);
            res.set({
                'Content-Type': response.headers['content-type'],
                'X-Upload-Id': updatedUpload.id,
                'X-Detection-Status': updatedUpload.detectionStatus,
                'Content-Disposition': response.headers['content-disposition'] ||
                    `attachment; filename=annotated_${file.originalname}.mp4`,
            });
            res.send(response.data);
        }
        catch (error) {
            await this.prisma.upload.update({
                where: { id: uploadRecord.id },
                data: { processingStatus: 'FAILED' }
            });
            throw new common_1.HttpException('Error during prediction', 500);
        }
    }
    async predictImage(file, res) {
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://localhost:8000/predict_image', formData, {
                headers: formData.getHeaders(),
                responseType: 'arraybuffer',
            }));
            res.set({
                'Content-Type': response.headers['content-type'],
                'Content-Disposition': response.headers['content-disposition'] ||
                    `attachment; filename=annotated_${file.originalname}`,
            });
            res.send(response.data);
        }
        catch (error) {
            throw new common_1.HttpException('Error during prediction', 500);
        }
    }
};
exports.PredictController = PredictController;
__decorate([
    (0, common_1.Post)('video'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], PredictController.prototype, "predictVideo", null);
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictController.prototype, "predictImage", null);
exports.PredictController = PredictController = __decorate([
    (0, common_1.Controller)('predict'),
    __metadata("design:paramtypes", [axios_1.HttpService,
        predict_service_1.PredictService,
        client_1.PrismaClient])
], PredictController);
//# sourceMappingURL=predict.controller.js.map