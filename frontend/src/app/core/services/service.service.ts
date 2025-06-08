import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface Model {
  id: number;
  name: string;
  description: string;
  category: string;
  purchaseDate: Date;
  status: "active" | "expired" | "pending";
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
  providedIn: "root",
})
export class ServiceService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  createService(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/services/create`, serviceData);
  }

  getAllServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services`);
  }

  getModelTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/model-types`);
  }

  createServiceRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/services/request`, requestData);
  }

  getCustomerServiceRequests(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/${customerId}/requests`);
  }

  getAllServiceRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/requests`);
  }

  updateServiceRequestStatus(
    requestId: string,
    status: "PENDING" | "IN_PROGRESS" | "WAITING_FOR_INFO" | "COMPLETED",
    developerId: string
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/services/requests/${requestId}/status`,
      {
        status,
        developerId,
      }
    );
  }

  replyToServiceRequest(requestId: string, message: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/services/requests/${requestId}/reply`,
      {
        message,
      }
    );
  }

  getMostUsedModels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/most-used`);
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
    return this.http.get(`${this.apiUrl}/download/model/${modelId}`, {
      responseType: "blob",
    });
  }

  getAboutData(): Observable<AboutData> {
    return this.http.get<AboutData>(`${this.apiUrl}/about`);
  }

  sendContactMessage(message: ContactMessage): Observable<any> {
    return this.http.post(`${environment.apiUrl}/contact`, message);
  }

  assignServiceRequestToDeveloper(
    requestId: string,
    developerId: string
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/services/requests/${requestId}/assign`,
      {
        developerId,
      }
    );
  }

  getRecommendedModel(askAiFormData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/model-recommendation`, askAiFormData);
  }
}
