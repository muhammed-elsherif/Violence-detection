import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Model } from './service.service';

interface UploadResponse {
  videoUrl: string;
  overallStatus: string;
  overallConfidence: number;
  violentFrames: number;
  totalFrames: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {

  constructor(private http: HttpClient) {}

  uploadFile(file: File, selectedModel: Model): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // send access token in the headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.post<UploadResponse>(environment.apiUrl + "/" + selectedModel.endpoint, formData, {
      headers: headers,
    });
  }
}
