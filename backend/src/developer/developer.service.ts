import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserDto } from 'src/user/user.dto';

@Injectable()
export class DeveloperService {
  constructor(private prisma: PrismaClient) {}

  async getDevelopers() {
    return this.prisma.developer.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
      },
    });
  }

  async getAssignedTasks(id: string) {
    const assignedTasks = await this.prisma.developer.findUnique({
      where: { id },
      select: {
        serviceRequests: true,
      },
    });
    if (!assignedTasks) throw new NotFoundException(`Developer ${id} not found`);
    return assignedTasks;
  }

  async createDeveloper(username: string, email: string, password: string) {
    const existingUser = await this.prisma.developer.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.developer.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
  }

  async deleteDeveloper(id: string): Promise<void> {
    const existing = await this.prisma.developer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    await this.prisma.developer.delete({ where: { id } });
  }

  async activateDeveloper(id: string): Promise<UserDto> {
    const user = await this.prisma.developer.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return new UserDto(user);
  }

  async deactivateDeveloper(id: string): Promise<UserDto> {
    const user = await this.prisma.developer.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return new UserDto(user);
  }
}
