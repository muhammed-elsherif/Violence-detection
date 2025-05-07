import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserAdminService {
  constructor(private _HttpClient: HttpClient) {}

  getUserStats(): Observable<any> {
    return this._HttpClient.get(
      "http://localhost:4000/user-stats/upload-stats"
    );
  }

  createUser(createUserData: any): Observable<any> {
    return this._HttpClient.post(
      "http://localhost:4000/user-stats/create-user",
      createUserData
    );
  }

  activateUser(userId: string): Observable<any> {
    return this._HttpClient.post(
      `http://localhost:4000/dashboard/users/${userId}/activate`,
      {}
    );
  }

  deactivateUser(userId: string): Observable<any> {
    return this._HttpClient.post(
      `http://localhost:4000/dashboard/users/${userId}/deactivate`,
      {}
    );
  }
  
  deleteUser(userId: string): Observable<any> {
    return this._HttpClient.delete(
      `http://localhost:4000/dashboard/users/${userId}`
    );
  }
}
