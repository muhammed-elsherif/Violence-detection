import { HttpService } from "@nestjs/axios";
import {
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PrismaClient } from "@prisma/client";
import * as FormData from "form-data";
import { firstValueFrom } from "rxjs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PredictService } from "./predict.service";
import {
  MulterFile,
  ViolenceVideoPredictionResponse,
} from "../prisma-sql/prisma-sql.service";

export interface VideoDetectionResult {
  overallStatus: "VIOLENCE_DETECTED" | "NON_VIOLENCE";
  overallConfidence: number;
  totalFrames: number;
  violentFrames?: number;
}
interface ImagePredictionResponse {
  contentType: string;
  contentDisposition: string;
  data: Buffer;
}

@ApiTags("Prediction")
@Controller("predict")
export class PredictController {
  constructor(
    private readonly httpService: HttpService,
    private readonly predictService: PredictService,
    private prisma: PrismaClient
  ) {}

  @Post("video")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Upload and analyze video for violence detection",
    description:
      "Upload a video file to detect violence. The video will be processed and analyzed for violent content.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description:
            "Video file to analyze (supported formats: mp4, avi, mov)",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Video successfully analyzed",
    schema: {
      type: "object",
      properties: {
        videoUrl: {
          type: "string",
          description: "URL to access the processed video",
          example: "/predict/video/123e4567-e89b-12d3-a456-426614174000",
        },
        overallStatus: {
          type: "string",
          enum: ["VIOLENCE_DETECTED", "NON_VIOLENCE"],
          description: "Overall detection status of the video",
          example: "NON_VIOLENCE",
        },
        overallConfidence: {
          type: "number",
          description: "Confidence score of the detection (0-1)",
          example: 0.95,
        },
        violentFrames: {
          type: "number",
          description: "Number of frames detected as violent",
          example: 0,
        },
        totalFrames: {
          type: "number",
          description: "Total number of frames in the video",
          example: 300,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid file format",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 400,
        },
        message: {
          type: "string",
          example: "Unsupported video format",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error during prediction",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 500,
        },
        message: {
          type: "string",
          example: "Error during prediction",
        },
      },
    },
  })
  async predictVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } }
  ): Promise<ViolenceVideoPredictionResponse> {
    const userId = req.user.sub;

    try {
      return await this.predictService.predictVideo(file, userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Error during prediction",
        error.status || 500
      );
    }
  }

  @Get("video/:id")
  @ApiResponse({
    status: 200,
    description: "Fetch the annotated video",
    content: { "video/mp4": { schema: { type: "string", format: "binary" } } },
  })
  @ApiResponse({ status: 404, description: "Video not found" })
  async getAnnotatedVideo(@Param("id") id: string) {
    const upload = await this.prisma.uploadsHistory.findUnique({
      where: { id },
    });

    if (!upload || !upload.annotatedFilePath) {
      throw new HttpException("Video not found", 404);
    }

    return { filePath: upload.annotatedFilePath };
  }

  @Post("image")
  @UseInterceptors(FileInterceptor("file"))
  async predictImage(
    @UploadedFile() file: MulterFile
  ): Promise<ImagePredictionResponse> {
    const formData = new FormData();
    const apiUrl = process.env.PREDICT_IMAGE_API as string;
    formData.append("file", file.buffer, file.originalname);

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, formData, {
          headers: formData.getHeaders(),
          responseType: "arraybuffer",
        })
      );

      return {
        contentType: response.headers["content-type"] as string,
        contentDisposition:
          (response.headers["content-disposition"] as string) ||
          `attachment; filename=annotated_${file.originalname}`,
        data: response.data,
      };
    } catch {
      throw new HttpException("Error during prediction", 500);
    }
  }
}
