import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateServiceDto,
  CreateServiceRequestDto,
} from "./dto/create-service.dto";
import { ModelType, PrismaClient } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { AlertsGateway } from "../alerts/alerts.gateway";
import { UserDto } from "src/user/user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServiceService {
  constructor(
    private prisma: PrismaClient,
    private mail: MailService,
    private alertsGateway: AlertsGateway
  ) {}

  async createService(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        category: createServiceDto.category as ModelType,
      },
    });
  }

  async getAllServices() {
    return this.prisma.service.findMany();
  }

  async createServiceRequest(
    userId: string,
    createServiceRequestDto: CreateServiceRequestDto
  ) {
    const admin = await this.prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    const developer = await this.prisma.developer.findFirst({
      where: { isActive: true },
    });

    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        ...createServiceRequestDto,
        userId,
        developerId: developer?.id || "",
      },
    });

    if (admin) {
      this.alertsGateway.sendServiceRequest({
        id: serviceRequest.id,
        serviceName: serviceRequest.serviceName,
        serviceDescription: serviceRequest.serviceDescription,
        serviceCategory: serviceRequest.serviceCategory,
        userId: serviceRequest.userId,
        status: serviceRequest.status,
        createdAt: serviceRequest.createdAt,
      });

      // Send email to admin
      await this.mail.sendServiceRequestEmail(
        serviceRequest.serviceName,
        serviceRequest.serviceDescription,
        serviceRequest.serviceCategory,
        serviceRequest.useCase,
        serviceRequest.specificRequirements || "",
        serviceRequest.expectedTimeline,
        serviceRequest.budget || 0
      );
    }

    return serviceRequest;
  }

  async getServiceRequests(userId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { userId },
    });
  }

  async purchaseModel(userId: string, modelId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const model = await this.prisma.service.findUnique({
      where: { id: modelId },
    });

    if (!user || !model) {
      throw new Error("User or model not found");
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id: userId },
      data: {
        purchasedModels: {
          push: modelId,
        },
      },
    });

    // Emit model purchase event
    this.alertsGateway.sendModelPurchase({
      username: user.username,
      modelName: model.name,
    });

    return updatedCustomer;
  }

  async getMostUsedModels() {
    const serviceRequests = await this.prisma.customer.groupBy({
      by: ["purchasedModels"],
      _count: {
        purchasedModels: true,
      },
      orderBy: {
        _count: {
          purchasedModels: "desc",
        },
      },
      take: 10,
    });

    const serviceIds = serviceRequests.map(
      (sr) => sr.purchasedModels as string[]
    );
    const services = await this.prisma.service.findMany({
      where: {
        id: {
          in: serviceIds.flat(),
        },
      },
    });

    return services;
  }

  async getAllServiceRequests() {
    return this.prisma.serviceRequest.findMany({
      include: {
        developer: {
          select: {
            id: true,
            username: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async updateServiceRequestStatus(
    requestId: string,
    status: "pending" | "in_progress" | "waiting_for_info" | "completed",
    developerId: string
  ) {
    return this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status, developerId: developerId },
    });
  }

  async getServiceRequestsByDeveloper(developerName: string) {
    return this.prisma.developer.findMany({
      where: { username: developerName },
      include: { serviceRequests: true },
    });
  }

  async replyToServiceRequest(requestId: string, message: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { email: true } } },
    });

    if (!request) {
      throw new Error("Service request not found");
    }

    // Send email notification to user && make a socket notification
    await this.mail.sendServiceRequestReplyEmail(
      request.user.email,
      request.serviceName,
      message,
      request.serviceCategory
    );

    this.alertsGateway.sendServiceRequestReply(request);
    return request;
  }

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

  async createDeveloper(
    username: string,
    email: string,
    password: string,
  ) {
    const existingUser = await this.prisma.developer.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
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
      select: { id: true, username: true, email: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return new UserDto(user);
  }

  async deactivateDeveloper(id: string): Promise<UserDto> {
    const user = await this.prisma.developer.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, username: true, email: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return new UserDto(user);
  }
}
