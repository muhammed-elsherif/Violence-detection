import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';
import { Model } from '../../core/services/service.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

interface UploadResult {
  url: string;
  overallStatus: string;
  overallConfidence: number;
  violentFrames: number;
  totalFrames: number;
}

@Component({
  selector: 'app-technology',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.scss'],
})
export class TechnologyComponent implements OnDestroy {
  @Input() selectedModel!: Model;
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;
  resultUrl: UploadResult | null = null;
  resultType: 'video' | 'image' | null = null;
  selectedFiles: File[] = [];
  videoUrl: SafeUrl | null = null;
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
      this.errorMessage = 'Invalid file type! Only images and videos are allowed.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    this.resultUrl = null;
    this.cleanupVideo();
    this.resultType = file.type.startsWith('image/') ? 'image' : 'video';
  }

  validateFile(file: File): boolean {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/MOV', 'video/mov'
    ];
    return allowedTypes.includes(file.type);
  }

  upload() {
    if (!this.selectedFile) return;

    this.uploadProgress = 0;

    this.uploadService.uploadFile(this.selectedFile, this.selectedModel).subscribe({
      next: (result) => {
        this.resultUrl = {
          url: result.videoUrl,
          overallStatus: result.overallStatus,
          overallConfidence: result.overallConfidence,
          violentFrames: result.violentFrames,
          totalFrames: result.totalFrames
        };

        // Create a safe URL for the video
        const videoId = result.videoUrl.split('/').pop();
        const videoStreamUrl = `${environment.apiUrl}/predict/video/${videoId}`;
        this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(videoStreamUrl);

        // Schedule cleanup after 1 hour
        if (this.videoCleanupTimeout) {
          clearTimeout(this.videoCleanupTimeout);
        }
        this.videoCleanupTimeout = setTimeout(() => {
          this.cleanupVideo();
        }, 3600000); // 1 hour

        this.uploadProgress = 100;
      },
      error: (err) => {
        this.errorMessage = 'Upload failed. Please try again.';
        this.uploadProgress = null;
      }
    });
  }

  analyzeText() {
    console.log('Analyzing text');
  }
}
