import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto, CreateServiceRequestDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@Controller("services")
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}
  
  @Post("create")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.createService(createServiceDto);
  }
  
  @Get()
  async getAllServices() {
    return this.serviceService.getAllServices();
  }
  
  @Get("model-types")
  async getModelTypes() {
    return this.serviceService.getModelTypes();
  }
  
  @Post("request")
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @UseGuards(JwtAuthGuard)
  async createServiceRequest(
    @Request() req,
    @Body() createServiceRequestDto: CreateServiceRequestDto
  ) {
    return this.serviceService.createServiceRequest(
      req.user.sub,
      createServiceRequestDto
    );
  }
  
  // not verified
  @Get("customer/:customerId/requests")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCustomerServiceRequests(@Param("customerId") customerId: string) {
    return this.serviceService.getServiceRequests(customerId);
  }
  
  // not verified
  @Get("most-used")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getMostUsedModels() {
    return this.serviceService.getMostUsedModels();
  }
  
  @Get("requests")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllServiceRequests() {
    return this.serviceService.getAllServiceRequests();
  }
  
  @Patch("requests/:requestId/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  async updateServiceRequestStatus(
    @Param("requestId") requestId: string,
    @Body("status")
    status: "pending" | "in_progress" | "waiting_for_info" | "completed",
    @Body("developerId") developerId: string
  ) {
    return this.serviceService.updateServiceRequestStatus(
      requestId,
      status,
      developerId
    );
  }
  
  @Post("requests/:requestId/reply")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  async replyToServiceRequest(
    @Param("requestId") requestId: string,
    @Body("message") message: string
  ) {
    return this.serviceService.replyToServiceRequest(requestId, message);
  }
} 