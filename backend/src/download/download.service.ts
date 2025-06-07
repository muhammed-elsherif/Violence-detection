import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { createReadStream, existsSync } from "fs";
import { join } from "path";

@Injectable()
export class DownloadService {
  constructor(private readonly prisma: PrismaClient) {}

  async getModel(modelId: string) {
    return this.prisma.service.findUnique({
      where: { id: modelId },
      select: {
        id: true,
        name: true,
        modelFile: true,
      },
    });
  }

  async getModelWeightsStream(modelId: string) {
    const model = await this.getModel(modelId);
    if (!model) {
      return null;
    }

    // model weights are stored in model-weights directory with model name.pt.zip file or model name.zip file or model name.h5.zip file
    const weightsPath = join(process.cwd(), "src", "model-weights", model.name + ".pt.zip");

    if (!existsSync(weightsPath)) {
      return null;
    }

    return {
      stream: createReadStream(weightsPath),
      modelName: model.name,
    };
  }
}
