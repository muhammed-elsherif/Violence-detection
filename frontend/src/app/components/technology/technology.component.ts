import { Component, Input, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UploadService } from "../../core/services/upload.service";
import { Model } from "../../core/services/service.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { environment } from "../../../environments/environment";

interface UploadResult {
  url: string;
  overallStatus: string;
  overallConfidence: number;
  violentFrames: number;
  totalFrames: number;
}

interface AnalyzeResponse {
  analyzedText: string;
}

@Component({
  selector: "app-technology",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./technology.component.html",
  styleUrls: ["./technology.component.scss"],
})
export class TechnologyComponent implements OnDestroy {
  @Input() selectedModel!: Model;
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;
  text: string = "";
  resultUrl: UploadResult | null = null;
  resultText: AnalyzeResponse | null = null;
  resultType: "video" | "image" | null = null;
  selectedFiles: File[] = [];
  videoUrl: SafeUrl | null = null;
  isAnalyzing: boolean = false;
  isTextExist: boolean = false;
  private videoCleanupTimeout: any;

  constructor(
    private uploadService: UploadService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnDestroy() {
    if (this.videoCleanupTimeout) {
      clearTimeout(this.videoCleanupTimeout);
    }
    this.cleanupVideo();
  }

  private cleanupVideo() {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl.toString());
      this.videoUrl = null;
    }
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFiles = Array.from(input.files);
    const file: File = event.target.files[0];

    if (!this.validateFile(file)) {
      this.errorMessage =
        "Invalid file type! Only images and videos are allowed.";
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    this.resultUrl = null;
    this.cleanupVideo();
    this.resultType = file.type.startsWith("image/") ? "image" : "video";
  }

  validateFile(file: File): boolean {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/MOV",
      "video/mov",
    ];
    return allowedTypes.includes(file.type);
  }

  upload() {
    if (!this.selectedFile) return;

    this.uploadProgress = 0;

    this.uploadService
      .uploadFile(this.selectedFile, this.selectedModel)
      .subscribe({
        next: (result) => {
          this.resultUrl = {
            url: result.videoUrl,
            overallStatus: result.overallStatus,
            overallConfidence: result.overallConfidence,
            violentFrames: result.violentFrames,
            totalFrames: result.totalFrames,
          };

          this.videoUrl = `${result.videoUrl}`; // full URL to video

          this.uploadProgress = 100;
        },
        error: (err) => {
          console.error("Upload error:", err);
          this.errorMessage =
            err.error?.message ||
            err.message ||
            "Upload failed. Please try again.";
          this.uploadProgress = null;
        },
      });
  }

  inputText: string = "";
  analysisResult: string = "";

  analyzeText() {
    if (!this.inputText) return; // Ensure there's input to analyze

    this.isAnalyzing = true;
    this.uploadService
      .analyzeText(this.inputText, this.selectedModel)
      .subscribe({
        next: (result) => {
          this.resultText = {
            analyzedText: result.analyzedText,
          };
          this.analysisResult = result.analyzedText; // Display the actual analyzed text
          this.isAnalyzing = false;
        },
        error: (err) => {
          this.errorMessage = "Analysis failed. Please try again.";
          this.isAnalyzing = false;
        },
      });
  }
}
