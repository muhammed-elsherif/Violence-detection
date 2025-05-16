import { Injectable } from "@nestjs/common";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ModelType, PrismaClient } from "@prisma/client";
@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaClient) {}

  async createService(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        category: createServiceDto.category as ModelType,
      },
    });
  }

  async getAllServices() {
    return this.prisma.service.findMany({
      where: { isPublic: true },
    });
  }

  async createServiceRequest(userId: string, serviceId: string) {
    return this.prisma.serviceRequest.create({
      data: {
        serviceId,
        userId,
      },
      include: {
        service: true,
      },
    });
  }

  async purchaseModel(userId: string, modelId: string) {
    return this.prisma.customer.update({
      where: { id: userId },
      data: {
        purchasedModels: {
          push: modelId,
        },
      },
    });
  }

  async getServiceRequests(userId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { userId },
      include: {
        service: true,
      },
    });
  }

  async getMostUsedModels() {
    const serviceRequests = await this.prisma.serviceRequest.groupBy({
      by: ["serviceId"],
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: "desc",
        },
      },
      take: 10,
    });

    const serviceIds = serviceRequests.map((sr) => sr.serviceId);
    const services = await this.prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
    });

    return serviceRequests.map((sr) => ({
      service: services.find((s) => s.id === sr.serviceId),
      requestCount: sr._count.serviceId,
    }));
  }

  async getAllServiceRequests() {
    return this.prisma.serviceRequest.findMany();
  }
}
