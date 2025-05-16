import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl);
  }

  // Listen for service requests
  onServiceRequest(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('service_request', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for fire alerts
  onFireAlert(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('fire_detected', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for model purchases
  onModelPurchase(): Observable<{ username: string; modelName: string }> {
    return new Observable(observer => {
      this.socket.on('model_purchase', (data) => {
        observer.next(data);
      });
    });
  }

  // Disconnect socket when service is destroyed
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
} 