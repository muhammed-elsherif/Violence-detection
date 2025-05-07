// /* eslint-disable prettier/prettier */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-return */

// import { HttpService } from "@nestjs/axios";
// import { HttpException, Injectable } from "@nestjs/common";
// import { FileType, PrismaClient } from "@prisma/client";
// import * as FormData from "form-data";
// import { firstValueFrom } from "rxjs";
// import { MulterFile } from "./object-detection.controller";

// export interface VideoDetectionResult {
//     overallStatus: 'VIOLENCE_DETECTED' | 'NON_VIOLENCE';
//     overallConfidence: number;
//     violentFrames?: number;
//     totalFrames?: number;
//   }

// interface VideoPredictionResponse {
//   annotatedVideoUrl: string;
//   detectedLabels: { label: string, confidence: number }[];
// }

// @Injectable()
// export class ObjectDetectionService {
//   constructor(
//     private readonly httpService: HttpService,
//     private prisma: PrismaClient
//   ) {}

//   // Creates a record of the uploaded video in the database
//   createUploadRecord(userId: string, file: MulterFile, fileType: FileType) {
//     return this.prisma.$transaction(async (prisma) => {
//       const upload = await prisma.uploadsHistory.create({
//         data: {
//           userId,
//           fileType,
//           fileSize: file.size,
//           processingStatus: "PENDING",
//           uploadedAt: new Date(),
//         },
//       });

//       // Update or create UserUploadStats
//       await prisma.userUploadStats.upsert({
//         where: { userId },
//         update: {
//           totalUploads: { increment: 1 },
//           lastUploadDate: new Date(),
//         },
//         create: {
//           userId,
//           totalUploads: 1,
//           lastUploadDate: new Date(),
//         },
//       });

//       return upload;
//     });
//   }

//   // Handles saving the detection results and updating the user stats
//   async handleDetectionResults(uploadId: string, detectionData: any) {
//     return this.prisma.$transaction(async (prisma) => {
//       // Get the upload record to access userId
//       const upload = await prisma.uploadsHistory.findUnique({
//         where: { id: uploadId },
//         select: { userId: true, duration: true },
//       });

//       if (!upload) {
//         throw new Error("Upload record not found");
//       }

//       const updatedUpload = await prisma.uploadsHistory.update({
//         where: { id: uploadId },
//         data: {
//           processingStatus: "COMPLETED",
//           detectionStatus: detectionData.overallStatus,
//           overallConfidence: detectionData.overallConfidence,
//         },
//         include: {
//           detectionResults: true,
//         },
//       });

//       await prisma.userUploadStats.update({
//         where: { userId: upload.userId },
//         data: {
//           lastDetectionStatus: detectionData.overallStatus,
//           averageDuration: {
//             set: upload.duration || 0,
//           },
//         },
//       });

//       return updatedUpload;
//     });
//   }

//   // Main function to predict the video and store results
//   async detectObjectsInVideo(
//     file: MulterFile,
//     userId: string
//   ): Promise<VideoPredictionResponse> {
//     // Create an upload record in the database
//     const uploadRecord = await this.createUploadRecord(userId, file, "VIDEO");

//     try {
//       // Prepare the form data to send to the machine learning API
//       const formData = new FormData();
//       const apiUrl = process.env.PREDICT_VIDEO_API as string;

//       formData.append('file', file.buffer, {
//         filename: file.originalname,
//         contentType: file.mimetype,
//       }); 

//       // Send request to prediction API
//       const response = await firstValueFrom(
//         this.httpService.post(apiUrl, formData, {
//           headers: {
//             ...formData.getHeaders(),
//           },
//           responseType: "arraybuffer",
//         })
//       );

//       // Extract detection data from the response headers
//       const detectionData: VideoDetectionResult = JSON.parse(
//         response.headers["x-detection-results"] as string
//       ) as VideoDetectionResult;

//       // Get the annotated video URL
//       const annotatedVideoUrl = response.data as string; // Assuming the response data is the URL to the annotated video

//       // Prepare the detected labels and their confidences
//       const detectedLabels = detectionData.detectedLabels.map(label => ({
//         label: label.name,
//         confidence: label.confidence ?? 0,
//       }));

//       // Update the upload record with the detection results
//       const updatedUpload = await this.handleDetectionResults(
//         uploadRecord.id,
//         detectionData
//       );

//       return {
//         annotatedVideoUrl,  // Returning the URL of the annotated video
//         detectedLabels,     // Returning the list of detected labels and confidence
//       };
//     } catch (e) {
//       // Mark the upload as failed in case of error
//       await this.prisma.uploadsHistory.update({
//         where: { id: uploadRecord.id },
//         data: { processingStatus: "FAILED" },
//       });

//       console.error("Prediction error:", e);
//       throw new HttpException(
//         e.message || "Error during prediction",
//         e.status || 500
//       );
//     }
//   }
// }
