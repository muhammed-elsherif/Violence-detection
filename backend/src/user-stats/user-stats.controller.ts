import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User Statistics')
@Controller('user-stats')
@UseGuards(JwtAuthGuard)
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  @Get('upload-stats')
  @ApiOperation({
    summary: 'Get upload statistics for all users',
    description: 'Retrieves upload statistics and user information for all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'All user statistics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          totalUploads: { type: 'number' },
          averageDuration: { type: 'number' },
          lastDetectionStatus: { type: 'string' },
          lastUploadDate: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getUserUploadStats() {
    return this.userStatsService.getUserUploadStats();
  }
}
