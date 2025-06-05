import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from '../user/user.module'; 

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [DashboardController],
  providers: [],
})
export class DashboardModule {}
