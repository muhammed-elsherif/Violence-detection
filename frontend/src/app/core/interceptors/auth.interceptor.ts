import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('access-token');
    
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('refresh-token')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refresh-token');
      
      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((newTokens: any) => {
            this.isRefreshing = false;
            localStorage.setItem('access-token', newTokens.access_token);
            this.authService.saveUserData();
            this.refreshTokenSubject.next(newTokens.access_token);
            return next.handle(this.addToken(request, newTokens.access_token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => err);
          })
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next.handle(this.addToken(request, token));
      })
    );
  }
} 