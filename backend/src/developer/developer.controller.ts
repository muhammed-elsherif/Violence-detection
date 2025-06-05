import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { DeveloperService } from './developer.service';
import { DeveloperDto } from 'src/user/user.dto';
import { ApiResponse } from '@nestjs/swagger';
import { CreateDeveloperDto } from 'src/user/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller("developers")
@UseGuards(JwtAuthGuard)
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}
    
  @Get("/")
  async getDevelopers() {
    return this.developerService.getDevelopers();
  }

  @Post("/create-developer")
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
  deleteDeveloper(@Param("id") id: string): Promise<void> {
    return this.developerService.deleteDeveloper(id);
  }

  @Patch("/:id/activate")
  activateDeveloper(@Param("id") id: string): Promise<DeveloperDto> {
    return this.developerService.activateDeveloper(id);
  }

  @Patch("/:id/deactivate")
  deactivateDeveloper(@Param("id") id: string): Promise<DeveloperDto> {
    return this.developerService.deactivateDeveloper(id);
  }
}
