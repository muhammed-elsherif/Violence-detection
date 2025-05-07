import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpException,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ObjectDetectionService } from './object-detection.service';
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface VideoPredictionResponse {
  videoUrl: string;
  overallStatus: string;
  overallConfidence: number;
  totalFrames: number;
}

interface ImagePredictionResponse {
  contentType: string;
  contentDisposition: string;
  data: Buffer;
}

@ApiTags('Object Detection')
@Controller('object-detection')
export class ObjectDetectionController {
  constructor(
    private readonly objectDetectionService: ObjectDetectionService,
    private readonly prisma: PrismaClient,
  ) {}

  @Post('video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload and analyze video for object detection',
    description: 'Upload a video file to detect objects. The video will be processed and analyzed for object content.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file to analyze (supported formats: mp4, avi, mov)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video successfully analyzed',
    schema: {
      type: 'object',
      properties: {
        videoUrl: {
          type: 'string',
          description: 'URL to access the processed video',
          example: '/object-detection/video/123e4567-e89b-12d3-a456-426614174000',
        },
        labels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              confidence: { type: 'number' },
            },
          },
        },
        overallConfidence: {
          type: 'number',
          description: 'Confidence score of the detection (0-1)',
          example: 0.95,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Unsupported video format',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during prediction',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 500,
        },
        message: {
          type: 'string',
          example: 'Error during prediction',
        },
      },
    },
  })
  async detectObjectsInVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } },
  ): Promise<VideoPredictionResponse> {
    const userId = req.user.sub;

    try {
      return await this.objectDetectionService.detectObjectsInVideo(file, userId);
    } catch (error) {
      throw new HttpException(error.message || 'Object detection failed', error.status || 500);
    }
  }

  @Get('video/:id')
  @ApiOperation({ summary: 'Get annotated video by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the annotated video file',
    content: { 'video/mp4': { schema: { type: 'string', format: 'binary' } } },
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getAnnotatedVideo(@Param('id') id: string, @Res() res: Response) {
    const upload = await this.prisma.uploadsHistory.findUnique({ where: { id } });

    if (!upload || !upload.annotatedFilePath) {
      throw new HttpException('Video not found', 404);
    }

    res.sendFile(upload.annotatedFilePath, { root: '.' });
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Detect objects in an image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to analyze (supported formats: jpg, png, bmp)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image successfully analyzed',
    content: { 'image/png': { schema: { type: 'string', format: 'binary' } } },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during prediction',
  })
  async detectObjectsInImage(
    @UploadedFile() file: MulterFile,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.objectDetectionService.detectObjectsInImage(file);
      res.set({
        'Content-Type': result.contentType,
        'Content-Disposition': result.contentDisposition,
      });
      res.send(result.data);
    } catch {
      throw new HttpException('Error during image prediction', 500);
    }
  }
}
