/*import { UserRole } from '@prisma/client';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;        // <-- include new field
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
*/

//will be changed for future updates


// src/dashboard/dashboard.module.ts
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
