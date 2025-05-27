import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto, CreateServiceRequestDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDeveloperDto, DeveloperDto, UserDto } from 'src/user/user.dto';
import { ApiResponse } from '@nestjs/swagger';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  //   @Roles('ADMIN')
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.createService(createServiceDto);
  }

  @Get()
  async getAllServices() {
    return this.serviceService.getAllServices();
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  async createServiceRequest(@Request() req, @Body() createServiceRequestDto: CreateServiceRequestDto) {
    return this.serviceService.createServiceRequest(req.user.sub, createServiceRequestDto);
  }

  // not verified
  @Post('purchase-model')
  @UseGuards(JwtAuthGuard)
  async purchaseModel(@Request() req, @Body('modelId') modelId: string) {
    return this.serviceService.purchaseModel(req.user.sub, modelId);
  }
  
  // not verified
  @Get('customer/:customerId/requests')
  @UseGuards(JwtAuthGuard)
  async getCustomerServiceRequests(@Param('customerId') customerId: string) {
    return this.serviceService.getServiceRequests(customerId);
  }

  // not verified
  @Get('most-used')
  @UseGuards(JwtAuthGuard)
  async getMostUsedModels() {
    return this.serviceService.getMostUsedModels();
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  async getAllServiceRequests() {
    return this.serviceService.getAllServiceRequests();
  }

  @Patch('requests/:requestId/status')
  @UseGuards(JwtAuthGuard)
  async updateServiceRequestStatus(
    @Param('requestId') requestId: string,
    @Body('status') status: 'pending' | 'in_progress' | 'waiting_for_info' | 'completed',
    @Body('developerId') developerId: string
  ) {
    return this.serviceService.updateServiceRequestStatus(requestId, status, developerId);
  }

  @Post('requests/:requestId/reply')
  @UseGuards(JwtAuthGuard)
  async replyToServiceRequest(
    @Param('requestId') requestId: string,
    @Body('message') message: string
  ) {
    return this.serviceService.replyToServiceRequest(requestId, message);
  }

  @Get('developers')
  @UseGuards(JwtAuthGuard)
  async getDevelopers() {
    return this.serviceService.getDevelopers();
  }

  @Post('developers/create-developer')
  @ApiResponse({ status: 201 })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createUser(@Body() dto: CreateDeveloperDto): Promise<DeveloperDto> {
      const user = await this.serviceService.createDeveloper(dto.username, dto.email, dto.password); 
      return user;
  }

  @Delete('developers/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteDeveloper(@Param('id') id: string): Promise<void> {
    return this.serviceService.deleteDeveloper(id);
  }

  @Patch('developers/:id/activate')
  @UseGuards(JwtAuthGuard)
  activateDeveloper(@Param('id') id: string): Promise<DeveloperDto> {
    return this.serviceService.activateDeveloper(id);
  }

  @Patch('developers/:id/deactivate')
  @UseGuards(JwtAuthGuard)
  deactivateDeveloper(@Param('id') id: string): Promise<DeveloperDto> {
    return this.serviceService.deactivateDeveloper(id);
  }
} 