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
    /*aaaa */
  }
}
