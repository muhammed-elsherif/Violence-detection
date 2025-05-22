import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalVisits: number;
  averageSessionDuration: number;
  systemLoad: number;
  storageUsage: number;
  recentActivity: {
    timestamp: Date;
    action: string;
    user: string;
  }[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  analyticsData: AnalyticsData = {
    totalUsers: 0,
    activeUsers: 0,
    totalVisits: 0,
    averageSessionDuration: 0,
    systemLoad: 0,
    storageUsage: 0,
    recentActivity: []
  };

  displayedColumns: string[] = ['timestamp', 'action', 'user'];

  constructor() {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    // TODO: Implement API call to load analytics data
    // For now, using mock data
    this.analyticsData = {
      totalUsers: 150,
      activeUsers: 45,
      totalVisits: 1250,
      averageSessionDuration: 25,
      systemLoad: 65,
      storageUsage: 75,
      recentActivity: [
        {
          timestamp: new Date(),
          action: 'User Login',
          user: 'john.doe@example.com'
        },
        {
          timestamp: new Date(Date.now() - 3600000),
          action: 'File Upload',
          user: 'jane.smith@example.com'
        },
        {
          timestamp: new Date(Date.now() - 7200000),
          action: 'Settings Update',
          user: 'admin@example.com'
        }
      ]
    };
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  getSystemLoadColor(): string {
    if (this.analyticsData.systemLoad > 80) return 'warn';
    if (this.analyticsData.systemLoad > 60) return 'accent';
    return 'primary';
  }

  getStorageUsageColor(): string {
    if (this.analyticsData.storageUsage > 80) return 'warn';
    if (this.analyticsData.storageUsage > 60) return 'accent';
    return 'primary';
  }
}
