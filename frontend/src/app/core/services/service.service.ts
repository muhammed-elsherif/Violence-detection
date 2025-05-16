import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  createService(serviceData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, serviceData);
  }

  getAllServices(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createServiceRequest(requestData: { serviceId: string, customerId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, requestData);
  }

  getCustomerServiceRequests(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/${customerId}/requests`);
  }

  getAllServiceRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests`);
  }

  updateServiceRequestStatus(requestId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/requests/${requestId}/status`, { status });
  }

  replyToServiceRequest(requestId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests/${requestId}/reply`, { message });
  }

  getMostUsedModels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/most-used`);
  }

  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`);
  }
} 