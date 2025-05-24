import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Model {
  id: number;
  name: string;
  description: string;
  category: string;
  purchaseDate: Date;
  status: 'active' | 'expired' | 'pending';
  downloadUrl?: string;
  price: number;
  endpoint: string;
}

export interface AboutData {
  title: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  team: {
    name: string;
    role: string;
    bio: string;
    image: string;
  }[];
  stats: {
    customers: number;
    models: number;
    accuracy: number;
    support: number;
  };
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

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

  createServiceRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, requestData);
  }

  getCustomerServiceRequests(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/${customerId}/requests`);
  }

  getAllServiceRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests`);
  }

  updateServiceRequestStatus(requestId: string, status: string, developerId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/requests/${requestId}/status`, { status, developerId });
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

  purchaseModel(modelId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/models/${modelId}/purchase`, {});
  }

  requestModel(modelId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-model`, { modelId });
  }

  getUserModels(): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.apiUrl}/models/user`);
  }

  downloadModel(modelId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/download/model/${modelId}`, {
      responseType: 'blob'
    });
  }

  getAboutData(): Observable<AboutData> {
    return this.http.get<AboutData>(`${this.apiUrl}/about`);
  }

  sendContactMessage(message: ContactMessage): Observable<any> {
    return this.http.post(`${environment.apiUrl}/contact`, message);
  }

  getDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`);
  }

  assignServiceRequestToDeveloper(requestId: string, developerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests/${requestId}/assign`, { developerId });
  }
} 