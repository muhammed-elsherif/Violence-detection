import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../core/services/service.service';

interface AboutData {
  title: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  team: {
    name: string;
    role: string;
    bio: string;
    image: string;
  }[];
  stats: {
    customers: number;
    models: number;
    accuracy: number;
    support: number;
  };
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  aboutData: AboutData | null = null;
  loading = true;
  error: string | null = null;

  constructor(private serviceService: ServiceService) {}

  ngOnInit() {
    this.loadAboutData();
  }

  loadAboutData() {
    this.loading = true;
    this.error = null;

    this.serviceService.getAboutData().subscribe({
      next: (data) => {
        this.aboutData = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load about information. Please try again later.';
        this.loading = false;
        console.error('Error loading about data:', error);
      }
    });
  }
}
