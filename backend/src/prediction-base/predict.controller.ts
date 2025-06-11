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
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PredictService } from "../violence-detection/predict.service";
import {
  GunVideoPredictionResponse,
  MulterFile,
  ViolenceVideoPredictionResponse,
  FireVideoPredictionResponse,
  CrashVideoPredictionResponse,
  ObjectVideoPredictionResponse,
} from "../interface/video.interface";
import { Response } from "express";
import { GunDetectionService } from "src/gun-detection/gun-detection.service";
import { FireDetectionService } from "src/fire-detection/fire-detection.service";
import { CrashDetectionService } from "src/crash-detection/crash-detection.service";
import { ObjectDetectionService } from "src/object-detection/object-detection.service";
import { RolesGuard } from "src/auth/roles.guard";
import { UserRole } from "@prisma/client";
import { Roles } from "src/auth/roles.decorator";
import { UploadResponse } from "src/interface/processing.interface";
// import { RedisService } from '../redis/redis.service';

@ApiTags("Prediction")
@Controller("predict")
@UseGuards(JwtAuthGuard)
export class PredictController {
  constructor(
    private readonly predictService: PredictService,
    private readonly gunDetectionService: GunDetectionService,
    private readonly fireDetectionService: FireDetectionService,
    private readonly crashDetectionService: CrashDetectionService,
    private readonly objectDetectionService: ObjectDetectionService,
    // private readonly redisService: RedisService,
  ) {}

  @Post("violence-video")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
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
  @Roles(UserRole.ADMIN, UserRole.USER)
  async predictVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ): Promise<ViolenceVideoPredictionResponse> {
    const userId = req.user.sub;

    try {
      const result = await this.predictService.predictVideo(file, userId);

      return {
        videoUrl: result.videoUrl,
        overallStatus: result.overallStatus,
        overallConfidence: result.overallConfidence,
        violentFrames: result.violentFrames,
        totalFrames: result.totalFrames,
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Error during prediction",
        error.status || 500,
      );
    }
  }

  @Post("gun-video")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload and analyze video for gun detection",
    description:
      "Upload a video file to detect guns. The video will be processed and analyzed for gun presence.",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async predictGunVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ): Promise<GunVideoPredictionResponse> {
    const userId = req.user.sub;

    try {
      return await this.gunDetectionService.predictVideo(file, userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Error during prediction",
        error.status || 500,
      );
    }
  }

  @Post("fire-video")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload and analyze video for fire detection",
    description:
      "Upload a video file to detect fire. The video will be processed and analyzed for fire presence.",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  predictFireVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ): UploadResponse {
    const userId = req.user.sub;
    return this.fireDetectionService.predictVideo(file, userId);
  }

  @Post("crash-video")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload and analyze video for crash detection",
    description:
      "Upload a video file to detect car crashes. The video will be processed and analyzed for crash events.",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async predictCrashVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ): Promise<CrashVideoPredictionResponse> {
    const userId = req.user.sub;
    try {
      return await this.crashDetectionService.predictVideo(file, userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Error during crash detection",
        error.status || 500,
      );
    }
  }

  @Post("object-video")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload and analyze video for object detection",
    description:
      "Upload a video file to detect objects. The video will be processed and analyzed for various objects.",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async predictObjects(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ): Promise<ObjectVideoPredictionResponse> {
    const userId = req.user.sub;
    try {
      return await this.objectDetectionService.predictVideo(file, userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Error during object detection",
        error.status || 500,
      );
    }
  }

  @Post("image")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Upload and analyze image",
    description:
      "Upload an image file for analysis. The image will be processed based on the selected model.",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async predictImage(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ) {
    const userId = req.user.sub;
    try {
      return await this.predictService.predictImage(file, userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Error during image prediction",
        error.status || 500,
      );
    }
  }

  @Get("video/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: "Get processed video by ID",
    description: "Retrieve a processed video by its ID.",
  })
  @ApiResponse({
    status: 200,
    description: "Fetch the annotated video",
    content: { "video/mp4": { schema: { type: "string", format: "binary" } } },
  })
  @ApiResponse({ status: 404, description: "Video not found" })
  async getAnnotatedVideo(@Param("id") id: string, @Res() res: Response) {
    try {
      const videoStream = await this.predictService.getVideoStream(id);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `inline; filename=${id}.mp4`);
      videoStream.pipe(res);
    } catch (error) {
      throw new HttpException(
        error.message || "Error retrieving video",
        error.status || 500,
      );
    }
  }
}
