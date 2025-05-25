import { Controller, Get, Post, Body, Delete, Param, Patch, UsePipes, ValidationPipe, HttpCode, UseGuards } from '@nestjs/common';
import { UserDto, CreateUserDto, CreateDeveloperDto, DeveloperDto } from '../user/user.dto';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User Statistics')
@Controller('dashboard')
// @UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService, 
    private userService: UserService
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

  @Post('users/create-developer')
  @ApiResponse({ status: 201 })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createUser(@Body() dto: CreateDeveloperDto): Promise<DeveloperDto> {
      const user = await this.userService.createDeveloper(dto.username, dto.email, dto.password); 
      return user;
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