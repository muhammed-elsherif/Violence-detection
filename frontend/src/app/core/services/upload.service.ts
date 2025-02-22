import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = 'http://localhost:4000/predict/video';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<{ content: Blob; metadata: any }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', "542073e7-325f-4dbe-bb94-e1e3408fc5ac");

    return this.http.post(this.apiUrl, formData, {
      responseType: 'arraybuffer',
      observe: 'response',
    }).pipe(
      map((response: HttpResponse<ArrayBuffer>) => {
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        return {
          content: new Blob([response.body ?? new ArrayBuffer(0)], { type: contentType }),
          metadata: {
            uploadId: response.headers.get('X-Upload-Id') ?? null,
            detectionStatus: response.headers.get('X-Detection-Status') ?? null,
          },
        };
      })
    );
  }
}
