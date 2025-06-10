import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of notifications" 
           class="notification" 
           [class.service-request]="notification.type === 'service_request'"
           [class.fire-alert]="notification.type === 'fire_detected'"
           [class.model-purchase]="notification.type === 'model_purchase'"
           (mouseenter)="pauseTimeout(notification)"
           (mouseleave)="resumeTimeout(notification)">
        <div class="notification-content">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.message }}</p>
          <small>{{ notification.timestamp | date:'medium' }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    .notification {
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      min-width: 300px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }
    .service-request {
      border-left: 4px solid #3b82f6;
    }
    .fire-alert {
      border-left: 4px solid #ef4444;
    }
    .model-purchase {
      border-left: 4px solid #10b981;
    }
    .notification-content h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }
    .notification-content p {
      margin: 0 0 5px 0;
      font-size: 14px;
    }
    .notification-content small {
      color: #666;
      font-size: 12px;
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  private subscriptions: Subscription[] = [];
  private timeouts: Map<string, any> = new Map();

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    // Subscribe to service requests
    this.subscriptions.push(
      this.socketService.onServiceRequest().subscribe(data => {
        this.addNotification({
          id: Date.now().toString(),
          type: 'service_request',
          title: 'New Service Request',
          message: `New request for ${data.serviceName}`,
          timestamp: new Date()
        });
      })
    );

    // Subscribe to fire alerts
    this.subscriptions.push(
      this.socketService.onFireAlert().subscribe(data => {
        this.addNotification({
          id: Date.now().toString(),
          type: 'fire_detected',
          title: 'Fire Alert',
          message: 'Fire detected in monitored area',
          timestamp: new Date()
        });
      })
    );

    // Subscribe to model purchases
    this.subscriptions.push(
      this.socketService.onModelPurchase().subscribe(data => {
        this.addNotification({
          id: Date.now().toString(),
          type: 'model_purchase',
          title: 'New Model Purchase',
          message: `${data.username} purchased ${data.modelName}`,
          timestamp: new Date()
        });
      })
    );

    // Subscribe to contact form
    this.subscriptions.push(
      this.socketService.onContactForm().subscribe(data => {
        this.addNotification({
          id: Date.now().toString(),
          type: 'contact_form',
          title: 'New Contact Form',
          message: `${data.name} sent a message`,
          timestamp: new Date()
        });
      })
    );
  }

  private addNotification(notification: any) {
    this.notifications.unshift(notification);
    // Keep only last 5 notifications
    if (this.notifications.length > 5) {
      this.notifications.pop();
    }
    // Set timeout to remove notification
    this.setTimeout(notification);
  }

  private setTimeout(notification: any) {
    const timeout = setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000); // 5 seconds timeout
    this.timeouts.set(notification.id, timeout);
  }

  private removeNotification(id: string) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.timeouts.delete(id);
    }
  }

  pauseTimeout(notification: any) {
    const timeout = this.timeouts.get(notification.id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(notification.id);
    }
  }

  resumeTimeout(notification: any) {
    this.setTimeout(notification);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.socketService.disconnect();
  }
} 