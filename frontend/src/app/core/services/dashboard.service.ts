import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from "../interfaces/iall-users";

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

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getAnalyticsData(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`);
  }

  getUsersCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/users/count`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }
}
