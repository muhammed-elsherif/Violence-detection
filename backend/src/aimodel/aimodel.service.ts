import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateModelDto } from "./dto/create-model.dto";

@Injectable()
export class AiModelService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllModels() {
    return await this.prisma.aIModel.findMany({
      orderBy: { createdAt: 'desc' }, // Optional: returns latest models first
    });
  }

  async createModel(data: CreateModelDto) {
    const model = await this.prisma.aIModel.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        endpoint: data.endpoint,
      },
    });
    return model;
  }
}
