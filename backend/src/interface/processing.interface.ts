export interface ProcessingResponse {
  videoUrl: string;
  overallStatus: string;
  overallConfidence: number;
  totalFrames: number;
}

export interface UploadResponse {
  message: string;
  status: string;
}
