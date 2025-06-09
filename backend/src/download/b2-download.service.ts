import { Injectable } from "@nestjs/common";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Response } from "express";
import { HttpRequest } from "@aws-sdk/protocol-http";

@Injectable()
export class B2DownloadService {
  private s3 = new S3Client({
    region: process.env.B2_REGION!,
    endpoint: process.env.B2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_SECRET!,
    },
  });

  async downloadFile(res: Response) {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET!,
      Key: "attendance_app.zip",
    });

    try {
      this.s3.middlewareStack.addRelativeTo(
        (next, context) => async (args) => {
          const request = args.request as HttpRequest;
          if (request.headers && "x-amz-checksum-mode" in request.headers) {
            delete request.headers["x-amz-checksum-mode"];
          }
          return next(args);
        },
        {
          relation: "before",
          toMiddleware: "awsAuthMiddleware",
          name: "stripChecksumModeHeaderMiddleware"+ Math.random().toString(36).substring(2, 15),
        }
      );
      const data = await this.s3.send(command);
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="attendance-app.zip"'
      );
      res.setHeader("Content-Type", "application/zip");
      (data.Body as any).pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to download file.");
    }
  }
}
