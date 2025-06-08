/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Res,
  Query,
  BadRequestException,
  Header,
  UseGuards,
  Param,
} from "@nestjs/common";
import { createReadStream, statSync, existsSync } from "fs";
import { join } from "path";
import { Response } from "express";
import { DownloadService } from "./download.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("download")
// @UseGuards(JwtAuthGuard)
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}
  /**
   * GET /download/ai-desktop?platform=mac
   * GET /download/ai-desktop?platform=windows
   */
  @Get("model/:modelId")
  async downloadModel(@Res() res: Response, @Param("modelId") modelId: string) {
    const weightsData =
      await this.downloadService.getModelWeightsStream(modelId);

    if (!weightsData) {
      throw new BadRequestException("Model weights not found");
    }

    const { stream, modelName } = weightsData;
    const fileName = `${modelName}-weights.zip`;

    // Set headers for ZIP download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Handle stream errors
    stream.on("error", (err) => {
      console.error("Error reading model weights stream:", err);
      if (!res.headersSent) {
        res.status(500).send("Error reading the model weights.");
      }
      stream.destroy();
    });

    // Handle client abort
    res.on("close", () => {
      if (!res.writableEnded) {
        console.warn("Client aborted model weights download:", fileName);
        stream.destroy();
      }
    });

    // Stream the weights file
    stream.pipe(res);
  }

  @Get("ai-desktop")
  //  downloadApp(@Res() res) {
  // const fileName = process.platform === 'darwin'
  //   ? 'AI-Detector-1.0.0-mac.dmg'
  //   : 'AI-Detector-1.0.0-win.exe';
  // const filePath = join('../ai-desktop/dist', fileName);
  // return res.download(filePath, fileName);
  // @UseGuards(AuthGuard)
  async downloadApp(@Res() res: Response, @Query("platform") platform: string) {
    // 1) Determine which ZIP name to use
    let fileName: string;
    if (platform === "mac") {
      fileName = "AI-Detector-1.0.0-mac.zip";
    } else if (platform === "windows") {
      fileName = "attendance_app.zip";
    } else {
      throw new BadRequestException(
        "Invalid or missing platform. Use ?platform=mac or ?platform=windows"
      );
    }

    // 2) Build absolute path to dist/src/download/<fileName>
    //    (after you've copied the ZIPs into dist via nest-cli.json assets or manually)
    const filePath = join(__dirname, fileName);

    // 3) Verify the file exists
    if (!existsSync(filePath)) {
      return res
        .status(404)
        .send(
          `File "${fileName}" not found on server (looked in ${filePath}).`
        );
    }

    // 4) Get file size and stream handle
    const fileStat = statSync(filePath);
    const fileSize = fileStat.size;
    const fileStream = createReadStream(filePath);

    // 5) Set headers for a ZIP download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", fileSize.toString());

    // 6) Stream the file in chunks
    fileStream.on("error", (err) => {
      console.error("Error reading file stream:", err);
      if (!res.headersSent) {
        res.status(500).send("Error reading the file.");
      }
      fileStream.destroy();
    });

    // 7) Pipe to response—Express will handle backpressure automatically
    fileStream.pipe(res);

    // 8) Handle client abort (log it, but don't crash)
    res.on("close", () => {
      if (!res.writableEnded) {
        console.warn("Client aborted download:", fileName);
        fileStream.destroy();
      }
    });

    return;
  }

  @Get("drive-app")
  async downloadDriveApp(@Res() res: Response) {
    const fileId = "1YYVW-pY3BxfVY2_9xfRfb6NuYxtu7pmW";
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    await this.downloadService.downloadDriveApp(directDownloadUrl, res);
  }

  @Get("attendance-app")
  async downloadAttendanceApp(@Res() res: Response) {
    await this.downloadService.downloadFileFromDrive("attendance_app.zip", res);
  }
}



