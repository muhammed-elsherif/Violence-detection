import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from './dashboard.model';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    // Map raw IDs/dates into our DTO class
    return users.map(u => new UserDto(u));
  }
}
