import { Controller, Get, Delete, Param, Patch, HttpCode, UseGuards } from '@nestjs/common';
import { UserDto } from '../user/user.dto';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User Statistics')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService, 
  ) {}

  @Get('users')
  getAllUsers(): Promise<UserDto[]> {
    return this.dashboardService.getAllUsers();
  }

  @Get('users/count')
  @ApiOperation({
    summary: 'Get total number of users',
    description: 'Retrieves the total number of users in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'User count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' }
      }
    }
  })
  async getLoggedInUsersCount() {
    const count = await this.dashboardService.getLoggedInUsersCount();
    return { count };
  }

  @Delete('users/:id')
  @HttpCode(204)
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.dashboardService.deleteUser(id);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string): Promise<UserDto> {
    return this.dashboardService.activateUser(id);
  }

  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string): Promise<UserDto> {
    return this.dashboardService.deactivateUser(id);
  }
}