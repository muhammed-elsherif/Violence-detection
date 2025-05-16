import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto, CreateServiceRequestDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  async getMostUsedModels() {
    return this.serviceService.getMostUsedModels();
  }

  @Get('requests')
  async getAllServiceRequests() {
    return this.serviceService.getAllServiceRequests();
  }
} 