import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';
import { Router } from '@angular/router';

interface Model {
  id: number;
  name: string;
  description: string;
  purchaseDate: Date;
  status: 'active' | 'expired' | 'pending';
  downloadUrl?: string;
  modelType: string;
}

@Component({
  selector: 'app-my-models',
  templateUrl: './my-models.component.html',
  styleUrls: ['./my-models.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class MyModelsComponent implements OnInit {
  models: Model[] = [];
  loading = true;
  error: string | null = null;
  downloading = false;

  constructor(
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.loading = true;
    this.error = null;
    
    this.serviceService.getUserModels().subscribe({
      next: (models) => {
        this.models = models;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load models. Please try again later.';
        this.loading = false;
        console.error('Error loading models:', error);
      }
    });
  }

  downloadModel(model: Model): void {
    if (model.status === 'active') {
      this.downloading = true;
      this.error = null;

      // Map model name to model ID for download
      const modelId = model.name.toLowerCase().replace(/\s+/g, '-');

      this.serviceService.downloadModel(modelId).subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Set appropriate file extension based on platform
          const platform = this.getPlatform();
          let fileExtension;
          switch (platform) {
            case 'windows':
              fileExtension = '.exe';
              break;
            case 'mac':
              fileExtension = '.dmg';
              break;
            case 'linux':
              fileExtension = '.AppImage';
              break;
            default:
              fileExtension = '.zip';
          }
          
          link.download = `${model.name}-desktop${fileExtension}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.downloading = false;
        },
        error: (error) => {
          console.error('Error downloading model:', error);
          this.error = 'Failed to download model. Please try again later.';
          this.downloading = false;
        }
      });
    }
  }

  private getPlatform(): string {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('windows')) {
      return 'windows';
    } else if (userAgent.includes('mac')) {
      return 'mac';
    } else if (userAgent.includes('linux')) {
      return 'linux';
    }
    return 'unknown';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 