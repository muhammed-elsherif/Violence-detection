// src/user/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

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
  @ApiProperty({ example: 'john_doe' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  // @Matches(regex), { message: "Password too weak" })
  password: string;

  @IsOptional()
  role?: UserRole;
}
