import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserDto } from './dashboard.model';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('users')
  async getAllUsers(): Promise<UserDto[]> {
    return this.dashboardService.getAllUsers();
  }
}
