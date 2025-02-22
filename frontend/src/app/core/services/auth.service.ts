import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _HttpClient = inject(HttpClient);

  setLoginForm(data: object) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this._HttpClient.post('http://localhost:4000/auth/signin', data, {
      headers,
    });
  }

  setSignupForm(data: object) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this._HttpClient.post('http://localhost:4000/auth/signup', data, {
      headers,
    });
  }
}
