import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { DashboardService } from "../../core/services/dashboard.service";
import { User } from "../../core/interfaces/iall-users";

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
  selector: "app-analytics",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: "./analytics.component.html",
  styleUrl: "./analytics.component.scss",
})
export class AnalyticsComponent implements OnInit {
  analyticsData: AnalyticsData = {
    totalUsers: 0,
    activeUsers: 0,
    totalVisits: 0,
    averageSessionDuration: 0,
    systemLoad: 0,
    storageUsage: 0,
    recentActivity: [],
  };

  displayedColumns: string[] = ["timestamp", "action", "user"];
  users: User[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadUsersCount();
    this.loadUsers();
    this.loadAnalyticsData();
  }

  loadUsersCount(): void {
    this.dashboardService.getUsersCount().subscribe((response) => {
      this.analyticsData.totalUsers = response.count;
    });
  }

  loadUsers(): void {
    this.dashboardService.getAllUsers().subscribe((users: User[]) => {
      this.users = users;
      this.analyticsData.activeUsers = users.filter(
        (user) => user.isActive
      ).length;
    });
  }

  loadAnalyticsData(): void {
    this.dashboardService
      .getAnalyticsData()
      .subscribe((data: AnalyticsData) => {
        this.analyticsData = {
          ...this.analyticsData,
          totalVisits: data.totalVisits,
          averageSessionDuration: data.averageSessionDuration,
          systemLoad: data.systemLoad,
          storageUsage: data.storageUsage,
          recentActivity: data.recentActivity,
        };
      });
  }

  refreshData(): void {
    this.loadAllData();
  }

  getSystemLoadColor(): string {
    if (this.analyticsData.systemLoad > 80) return "warn";
    if (this.analyticsData.systemLoad > 60) return "accent";
    return "primary";
  }

  getStorageUsageColor(): string {
    if (this.analyticsData.storageUsage > 80) return "warn";
    if (this.analyticsData.storageUsage > 60) return "accent";
    return "primary";
  }
}
