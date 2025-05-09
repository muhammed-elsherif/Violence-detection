import { Component } from '@angular/core';
import { UploadService } from '../../core/services/upload.service';


@Component({
  selector: 'app-technology',
  imports: [],
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.scss'],
})
export class TechnologyComponent {
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;
  resultUrl: string | null = null;
  resultType: 'video' | 'image' | null = null;

  selectedFiles: File[] = [];

  constructor(private uploadService: UploadService) {}

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
    this.resultType = file.type.startsWith('image/') ? 'image' : 'video';
  }

  validateFile(file: File): boolean {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    return allowedTypes.includes(file.type);
  }

  upload() {
    if (!this.selectedFile) return;

    // Reset progress before starting upload.
    this.uploadProgress = 0;

    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (result) => {
        // 'result' is an object: { content: Blob, metadata: any }
        this.resultUrl = URL.createObjectURL(result.content);
        this.uploadProgress = 100;
      },
      error: (err) => {
        this.errorMessage = 'Upload failed. Please try again.';
        this.uploadProgress = null;
      }
    });
  }
}
