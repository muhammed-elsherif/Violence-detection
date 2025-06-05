import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'application/json'
    });

    const cloned = request.clone({
      headers: headers
    });
    
    return next(cloned);
  }
  
  return next(request);
}; 