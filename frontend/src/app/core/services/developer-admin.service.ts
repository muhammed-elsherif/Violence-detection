import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class DeveloperAdminService {
  constructor(private _HttpClient: HttpClient) {}

  private apiUrl = `${environment.apiUrl}/developers`;

  createDeveloper(createUserData: any): Observable<any> {
    return this._HttpClient.post(
      `${this.apiUrl}/create-developer`,
      createUserData
    );
  }

  activateDeveloper(developerId: string): Observable<any> {
    return this._HttpClient.patch(
      `${this.apiUrl}/${developerId}/activate`,
      {}
    );
  }

  deactivateDeveloper(developerId: string): Observable<any> {
    return this._HttpClient.patch(
      `${this.apiUrl}/${developerId}/deactivate`,
      {}
    );
  }
  
  deleteDeveloper(developerId: string): Observable<any> {
    return this._HttpClient.delete(
      `${this.apiUrl}/${developerId}`
    );
  }
}
