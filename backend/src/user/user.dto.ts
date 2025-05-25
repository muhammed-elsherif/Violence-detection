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

export class DeveloperDto {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

export class CreateDeveloperDto {
  @ApiProperty({ example: 'John Doe' })
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
  isActive?: boolean;
}
export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
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
