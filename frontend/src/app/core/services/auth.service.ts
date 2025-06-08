import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  userData:any = null 

  constructor() {
    this.isAuthenticatedSubject.next(!!this.getAccessToken());
  }

  setLoginForm(data: object) {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });

    return this._HttpClient
      .post("http://localhost:4000/auth/signin", data, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          this.setTokens(response.access_token, response.refresh_token);
        })
      );
  }

  setSignupForm(data: object): Observable<any> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });

    return this._HttpClient
      .post("http://localhost:4000/auth/signup", data, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          if (response.access_token && response.refresh_token) {
            this.setTokens(response.access_token, response.refresh_token);
          }
        })
      );
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  getUserRole(): string | null {
    return localStorage.getItem("role") || null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  saveUserData(): void {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      this.userData = jwtDecode(accessToken!);
    }
  }

  

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }
}
