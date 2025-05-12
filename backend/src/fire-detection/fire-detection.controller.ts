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
} from '@nestjs/common';
import { FireDetectionService } from './fire-detection.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MulterFile, FireVideoPredictionResponse } from '../prisma-sql/prisma-sql.service'

@ApiTags('Fire Detection')
@Controller('fire-detection')
export class FireDetectionController {
  constructor(private readonly fireDetectionService: FireDetectionService,
    private prisma: PrismaClient
  ) {}
  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Upload and analyze video for gun detection',
    description: 'Upload a video file to detect guns. The video will be processed and analyzed for gun content.',
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
        },
        overallStatus: {
          type: 'string',
          enum: ['GUN_DETECTED', 'NO_GUN'],
          description: 'Overall detection status of the video',
        },
        overallConfidence: {
          type: 'number',
          description: 'Confidence score of the detection (0-1)',
        },
        numberOfGuns: {
          type: 'number',
          description: 'Number of guns detected in the video',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during prediction',
  })
  async predictVideo(
    @UploadedFile() file: MulterFile,
    @Request() req: { user: { sub: string } }
  ): Promise<FireVideoPredictionResponse> {
    const userId = req.user.sub;
    // const userId = "e8d4bfce-de04-403f-b6c2-14c6af3c0ea6";
    try {
      return await this.fireDetectionService.predictVideo(file, userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error during prediction',
        error.status || 500
      );
    }
  }

  @Get('video/:id')
  @ApiResponse({
    status: 200,
    description: 'Fetch the annotated video',
    content: { 'video/mp4': { schema: { type: 'string', format: 'binary' } } },
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getAnnotatedVideo(@Param('id') id: string) {
    const upload = await this.prisma.uploadsHistory.findUnique({
      where: { id },
    });

    if (!upload || !upload.annotatedFilePath) {
      throw new HttpException('Video not found', 404);
    }

    return { filePath: upload.annotatedFilePath };
  }
}
