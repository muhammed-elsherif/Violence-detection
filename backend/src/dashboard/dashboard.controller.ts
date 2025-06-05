import { Controller, Get, Delete, Param, Patch, HttpCode, UseGuards } from '@nestjs/common';
import { UserDto } from '../user/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';

@ApiTags('User Statistics')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('users')
  getAllUsers(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
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
  async getUsersCount() {
    const count = await this.userService.getUsersCount();
    return { count };
  }

  @Delete('users/:id')
  @HttpCode(204)
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.activateUser(id);
  }

  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.deactivateUser(id);
  }
}