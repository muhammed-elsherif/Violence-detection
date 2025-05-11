import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

interface Model {
  id: number;
  name: string;
  description: string;
  purchaseDate: Date;
  status: 'active' | 'expired' | 'pending';
  downloadUrl?: string;
}

@Component({
  selector: 'app-my-models',
  templateUrl: './my-models.component.html',
  styleUrls: ['./my-models.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, NgClass]
})
export class MyModelsComponent implements OnInit {
  models: Model[] = [];
  loading = true;

  constructor() {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    // TODO: Implement service call to get user's models
    // Simulated data for now
    this.models = [
      {
        id: 1,
        name: 'Violence Detection Model',
        description: 'Real-time violence detection in video streams',
        purchaseDate: new Date('2024-03-15'),
        status: 'active',
        downloadUrl: '/api/models/download/1'
      },
      {
        id: 2,
        name: 'Object Detection Model',
        description: 'Advanced object detection and tracking',
        purchaseDate: new Date('2024-03-10'),
        status: 'active',
        downloadUrl: '/api/models/download/2'
      }
    ];
    this.loading = false;
  }

  downloadModel(model: Model): void {
    if (model.downloadUrl) {
      // TODO: Implement download logic
      console.log('Downloading model:', model.name);
      window.open(model.downloadUrl, '_blank');
    }
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