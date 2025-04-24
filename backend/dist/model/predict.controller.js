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
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const predict_service_1 = require("./predict.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PredictController = class PredictController {
    constructor(httpService, predictService, prisma) {
        this.httpService = httpService;
        this.predictService = predictService;
        this.prisma = prisma;
    }
    async predictVideo(file, req) {
        const userId = req.user.sub;
        try {
            return await this.predictService.predictVideo(file, userId);
        }
        catch {
            throw new common_1.HttpException('Error during prediction', 500);
        }
    }
    async getAnnotatedVideo(id) {
        const upload = await this.prisma.uploadsHistory.findUnique({ where: { id } });
        if (!upload || !upload.annotatedFilePath) {
            throw new common_1.HttpException('Video not found', 404);
        }
        return { filePath: upload.annotatedFilePath };
    }
    async predictImage(file) {
        const formData = new FormData();
        const apiUrl = process.env.PREDICT_IMAGE_API;
        formData.append('file', file.buffer, file.originalname);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(apiUrl, formData, {
                headers: formData.getHeaders(),
                responseType: 'arraybuffer',
            }));
            return {
                contentType: response.headers['content-type'],
                contentDisposition: response.headers['content-disposition'] ||
                    `attachment; filename=annotated_${file.originalname}`,
                data: response.data,
            };
        }
        catch {
            throw new common_1.HttpException('Error during prediction', 500);
        }
    }
};
exports.PredictController = PredictController;
__decorate([
    (0, common_1.Post)('video'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PredictController.prototype, "predictVideo", null);
__decorate([
    (0, common_1.Get)('video/:id'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fetch the annotated video',
        content: { 'video/mp4': { schema: { type: 'string', format: 'binary' } } },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Video not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PredictController.prototype, "getAnnotatedVideo", null);
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PredictController.prototype, "predictImage", null);
exports.PredictController = PredictController = __decorate([
    (0, swagger_1.ApiTags)('Prediction'),
    (0, common_1.Controller)('predict'),
    __metadata("design:paramtypes", [axios_1.HttpService,
        predict_service_1.PredictService,
        client_1.PrismaClient])
], PredictController);
//# sourceMappingURL=predict.controller.js.map