import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
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
  async createServiceRequest(@Body() createServiceRequestDto: CreateServiceRequestDto) {
    return this.serviceService.createServiceRequest(createServiceRequestDto);
  }

  @Get('customer/:customerId/requests')
  @UseGuards(JwtAuthGuard)
  async getCustomerServiceRequests(@Param('customerId') customerId: string) {
    return this.serviceService.getServiceRequests(customerId);
  }

  @Get('most-used')
  async getMostUsedModels() {
    return this.serviceService.getMostUsedModels();
  }

  @Get('customers')
  @UseGuards(JwtAuthGuard)
//   @Roles('ADMIN')
  async getAllCustomers() {
    return this.serviceService.getAllCustomers();
  }
} 