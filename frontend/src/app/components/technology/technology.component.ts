import { Component } from '@angular/core';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-technology',
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.scss'], // Fixed property name here
})
export class TechnologyComponent {
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  errorMessage: string | null = null;
  resultUrl: string | null = null;
  resultType: 'video' | 'image' | null = null;

  constructor(private uploadService: UploadService) {}

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  selectedFiles: File[] = [];

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
    const file: File = event.target.files[0];

    if (!file) return;

    if (!this.validateFile(file)) {
      this.errorMessage = 'Invalid file type! Only images and videos are allowed.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    this.resultUrl = null;

    if (file.type.startsWith('image/')) {
      this.resultType = 'image';
    } else if (file.type.startsWith('video/')) {
      this.resultType = 'video';
    }
  }

  validateFile(file: File): boolean {
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    return (
      allowedImageTypes.includes(file.type) ||
      allowedVideoTypes.includes(file.type)
    );
  }

  upload() {
    if (!this.selectedFile) return;

    // Reset progress before starting upload.
    this.uploadProgress = 0;

    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (result) => {
        // 'result' is an object: { content: Blob, metadata: any }
        this.resultUrl = URL.createObjectURL(result.content);
        console.log('Upload success:', result.metadata);
        this.uploadProgress = 100;
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.errorMessage = 'Upload failed. Please try again.';
        this.uploadProgress = null;
      }
    });
  }
}
