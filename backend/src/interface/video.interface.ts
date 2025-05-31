// Define a custom interface for the uploaded file.
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ViolenceVideoPredictionResponse {
  videoUrl: string;
  overallStatus: "VIOLENCE_DETECTED" | "NON_VIOLENCE";
  overallConfidence: number;
  violentFrames: number;
  totalFrames: number;
}

export interface GunVideoPredictionResponse {
  videoUrl: string;
  overallStatus: "GUN_DETECTED" | "NO_GUN";
  overallConfidence: number;
  numberOfGuns: number;
  totalFrames: number;
}

export interface ObjectVideoPredictionResponse {
  videoUrl: string;
  totalFrames: number;
  uniqueObjects: string[];
  detectedLabels?: { label: string; confidence: number }[];
}

export interface FireVideoPredictionResponse {
  videoUrl: string;
  overallStatus: "FIRE_DETECTED" | "NO_FIRE";
  overallConfidence: number;
  totalFrames: number;
}

export interface CrashVideoPredictionResponse {
  videoUrl: string;
  overallStatus: "CRASH_DETECTED" | "NO_CRASH";
  overallConfidence: number;
  totalFrames: number;
}

export interface ObjectDetectionResponse {
  videoUrl: string;
  detectedObjects: string[];
  totalFrames: number;
}

export interface ImagePredictionResponse {
  imageUrl: string;
  overallStatus: string;
  overallConfidence: number;
}
