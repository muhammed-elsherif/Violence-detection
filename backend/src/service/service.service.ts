import { Injectable } from "@nestjs/common";
import { CreateServiceDto, CreateServiceRequestDto } from "./dto/create-service.dto";
import { ModelType, PrismaClient } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { AlertsGateway } from "../alerts/alerts.gateway";

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaClient, private mail: MailService, private alertsGateway: AlertsGateway) {}

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

  async createServiceRequest(userId: string, createServiceRequestDto: CreateServiceRequestDto) {
    const admin = await this.prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        ...createServiceRequestDto,
        userId,
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
        serviceRequest.serviceCategory
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
      throw new Error('User or model not found');
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
      modelName: model.name
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

    const serviceIds = serviceRequests.map((sr) => sr.purchasedModels as string[]);
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
    return this.prisma.serviceRequest.findMany();
  }
}
