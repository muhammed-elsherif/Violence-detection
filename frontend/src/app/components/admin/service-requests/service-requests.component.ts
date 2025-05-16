import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../core/services/service.service';

interface ServiceRequest {
  id: string;
  serviceName: string;
  serviceDescription: string;
  serviceCategory: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  user?: {
    email: string;
    username: string;
  };
}

@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h2>Service Requests</h2>
      
      <!-- Status Filter -->
      <div class="mb-4">
        <select class="form-select w-auto" [(ngModel)]="statusFilter" (change)="filterRequests()">
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <!-- Requests Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>User</th>
              <th>Service Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (request of filteredRequests; track request.id) {
              <tr>
                <td>{{ request.user?.username || 'N/A' }}</td>
                <td>{{ request.serviceName }}</td>
                <td>{{ request.serviceCategory }}</td>
                <td>{{ request.serviceDescription }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning': request.status === 'pending',
                    'bg-info': request.status === 'in_progress',
                    'bg-success': request.status === 'completed'
                  }">
                    {{ request.status | titlecase }}
                  </span>
                </td>
                <td>{{ request.createdAt | date:'medium' }}</td>
                <td>
                  <div class="btn-group">
                    @if (request.status === 'pending') {
                      <button class="btn btn-sm btn-primary" (click)="startRequest(request)">
                        Start
                      </button>
                    }
                    @if (request.status === 'in_progress') {
                      <button class="btn btn-sm btn-success" (click)="completeRequest(request)">
                        Complete
                      </button>
                    }
                    <button class="btn btn-sm btn-info" (click)="openReplyModal(request)">
                      Reply
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Reply Modal -->
      @if (selectedRequest) {
        <div class="modal fade show" style="display: block;" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Reply to Request</h5>
                <button type="button" class="btn-close" (click)="closeReplyModal()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Message</label>
                  <textarea class="form-control" rows="4" [(ngModel)]="replyMessage"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeReplyModal()">Close</button>
                <button type="button" class="btn btn-primary" (click)="sendReply()">Send Reply</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show"></div>
      }
    </div>
  `,
  styles: [`
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .badge {
      padding: 0.5em 1em;
    }
  `]
})
export class ServiceRequestsComponent implements OnInit {
  serviceRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  statusFilter: string = 'all';
  selectedRequest: ServiceRequest | null = null;
  replyMessage: string = '';

  constructor(private serviceService: ServiceService) {}

  ngOnInit() {
    this.loadServiceRequests();
  }

  loadServiceRequests() {
    this.serviceService.getAllServiceRequests().subscribe({
      next: (requests) => {
        this.serviceRequests = requests;
        this.filterRequests();
      },
      error: (error) => {
        console.error('Error loading service requests:', error);
      }
    });
  }

  filterRequests() {
    if (this.statusFilter === 'all') {
      this.filteredRequests = this.serviceRequests;
    } else {
      this.filteredRequests = this.serviceRequests.filter(
        request => request.status === this.statusFilter
      );
    }
  }

  startRequest(request: ServiceRequest) {
    this.serviceService.updateServiceRequestStatus(request.id, 'in_progress').subscribe({
      next: () => {
        request.status = 'in_progress';
        this.filterRequests();
      },
      error: (error) => {
        console.error('Error updating request status:', error);
      }
    });
  }

  completeRequest(request: ServiceRequest) {
    this.serviceService.updateServiceRequestStatus(request.id, 'completed').subscribe({
      next: () => {
        request.status = 'completed';
        this.filterRequests();
      },
      error: (error) => {
        console.error('Error updating request status:', error);
      }
    });
  }

  openReplyModal(request: ServiceRequest) {
    this.selectedRequest = request;
    this.replyMessage = '';
  }

  closeReplyModal() {
    this.selectedRequest = null;
    this.replyMessage = '';
  }

  sendReply() {
    if (this.selectedRequest && this.replyMessage.trim()) {
      this.serviceService.replyToServiceRequest(
        this.selectedRequest.id,
        this.replyMessage
      ).subscribe({
        next: () => {
          this.closeReplyModal();
        },
        error: (error) => {
          console.error('Error sending reply:', error);
        }
      });
    }
  }
} 