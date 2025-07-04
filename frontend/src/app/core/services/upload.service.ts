import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Model } from "./service.service";

interface UploadResponse {
  videoUrl: string;
  overallStatus: string;
  overallConfidence: number;
  violentFrames: number;
  totalFrames: number;
}

interface AnalyzeResponse {
  analyzedText: string;
}

@Injectable({
  providedIn: "root",
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File, selectedModel: Model): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/${selectedModel.endpoint}`,
      formData
    );
  }

  analyzeText(text: String, selectedModel: Model): Observable<AnalyzeResponse> {
    return this.http.post<AnalyzeResponse>(
      `${this.apiUrl}/${selectedModel.endpoint}`,
      text
    );
  }

  getVideoUrl(filename: string): string {
    return `${this.apiUrl}/predict/video/${filename}`;
  }
}
