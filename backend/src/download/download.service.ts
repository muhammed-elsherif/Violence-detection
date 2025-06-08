import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { Response } from "express";
import axios from "axios";

@Injectable()
export class DownloadService {
  constructor(private readonly prisma: PrismaClient) {}

  async getModel(modelId: string) {
    return this.prisma.service.findUnique({
      where: { id: modelId },
      select: {
        id: true,
        name: true,
        // modelFile: true,
      },
    });
  }

  async getModelWeightsStream(modelId: string) {
    const model = await this.getModel(modelId);
    if (!model) {
      return null;
    }

    // model weights are stored in model-weights directory with model name.pt.zip file or model name.zip file or model name.h5.zip file
    const weightsPath = join(
      process.cwd(),
      "src",
      "model-weights",
      model.name + ".pt.zip"
    );

    if (!existsSync(weightsPath)) {
      return null;
    }

    return {
      stream: createReadStream(weightsPath),
      modelName: model.name,
    };
  }

  async downloadDriveApp(directDownloadUrl: string, res: Response) {
    const response = await axios.get(directDownloadUrl, {
      responseType: "stream",
    });

    res.set({
      "Content-Type": response.headers["content-type"],
      "Content-Disposition": 'attachment; filename="attendance-app.zip"',
    });

    response.data.pipe(res);
  }

  async downloadFileFromDrive(fileName: string, res: Response) {
    const filePath = join(process.cwd(), "src", "application", fileName);

    if (!existsSync(filePath)) {
      throw new BadRequestException("File not found");
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
