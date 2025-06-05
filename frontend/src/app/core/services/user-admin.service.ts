import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserAdminService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private _HttpClient: HttpClient) {}

  getUserStats(): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/user-stats/upload-stats`);
  }

  getAllUsers(): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/dashboard/users`);
  }

  activateUser(userId: string): Observable<any> {
    return this._HttpClient.patch(
      `${this.apiUrl}/dashboard/users/${userId}/activate`,
      {}
    );
  }

  deactivateUser(userId: string): Observable<any> {
    return this._HttpClient.patch(
      `${this.apiUrl}/dashboard/users/${userId}/deactivate`,
      {}
    );
  }

  deleteUser(userId: string): Observable<any> {
    return this._HttpClient.delete(`${this.apiUrl}/dashboard/users/${userId}`);
  }
}
