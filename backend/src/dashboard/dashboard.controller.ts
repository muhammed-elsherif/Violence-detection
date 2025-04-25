import { Controller, Get, Post, Body, Delete, Param, Patch, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserDto, CreateUserDto } from './dashboard.model';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('users')
  getAllUsers(): Promise<UserDto[]> {
    return this.dashboardService.getAllUsers();
  }

  @Post('users')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createUser(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.dashboardService.createUser(dto);
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