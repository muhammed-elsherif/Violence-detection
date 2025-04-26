import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserStatsService {
  constructor(private prisma: PrismaClient) {}

  async getUserUploadStats() {
    return this.prisma.userUploadStats.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
  }
}
