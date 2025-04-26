// src/user/user.dto.ts
import { UserRole } from '@prisma/client';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}

export class CreateUserDto {
  @IsString()      username: string;
  @IsEmail()       email: string;
  @IsString()      password: string;
  @IsEnum(UserRole) @IsOptional()
                   role?: UserRole;
}
