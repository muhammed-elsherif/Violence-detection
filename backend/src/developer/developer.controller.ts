import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { DeveloperService } from './developer.service';
import { DeveloperDto } from 'src/user/user.dto';
import { ApiResponse } from '@nestjs/swagger';
import { CreateDeveloperDto } from 'src/user/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@Controller("developers")
@UseGuards(JwtAuthGuard)
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}
    
  @Get("/")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDevelopers() {
    return this.developerService.getDevelopers();
  }

  @Get("/assigned-tasks/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAssignedTasks(@Param("id") id: string) {
    return this.developerService.getAssignedTasks(id);
  }

  @Post("/create-developer")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 201 })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createUser(@Body() dto: CreateDeveloperDto): Promise<DeveloperDto> {
    const user = await this.developerService.createDeveloper(
      dto.username,
      dto.email,
      dto.password
    );
    return user;
  }

  @Delete("/:id")
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteDeveloper(@Param("id") id: string): Promise<void> {
    return this.developerService.deleteDeveloper(id);
  }

  @Patch("/:id/activate")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  activateDeveloper(@Param("id") id: string): Promise<DeveloperDto> {
    return this.developerService.activateDeveloper(id);
  }

  @Patch("/:id/deactivate")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivateDeveloper(@Param("id") id: string): Promise<DeveloperDto> {
    return this.developerService.deactivateDeveloper(id);
  }
}
