import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from '../user/user.module'; 

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
