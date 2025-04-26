// src/dashboard/dashboard.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto, CreateUserDto } from '../user/user.dto';
import * as bcrypt from 'bcrypt';

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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(u => new UserDto(u));
  }

  async createUser(dto: CreateUserDto): Promise<UserDto> {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hash,
        role: dto.role || undefined,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return new UserDto(user);
  }

  async deleteUser(id: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    await this.prisma.user.delete({ where: { id } });
  }

  async activateUser(id: string): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return new UserDto(user);
  }

  async deactivateUser(id: string): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return new UserDto(user);
  }
}