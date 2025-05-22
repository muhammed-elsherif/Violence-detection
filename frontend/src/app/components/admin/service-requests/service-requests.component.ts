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
  status: 'pending' | 'in_progress' | 'waiting_for_info' | 'completed';
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
          <option value="waiting_for_info">Waiting for Info</option>
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
                    'bg-danger': request.status === 'waiting_for_info',
                    'bg-success': request.status === 'completed'
                  }">
                    {{ request.status | titlecase }}
                  </span>
                </td>
                <td>{{ request.createdAt | date:'medium' }}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-primary me-2" (click)="openStatusModal(request)">
                      Change Status
                    </button>
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

      <!-- Status Change Modal -->
      @if (selectedRequest) {
        <div class="modal fade show" style="display: block;" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Change Request Status</h5>
                <button type="button" class="btn-close" (click)="closeStatusModal()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">New Status</label>
                  <select class="form-select" [(ngModel)]="newStatus">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_info">Waiting for Info</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeStatusModal()">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="updateStatus()">Update Status</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show"></div>
      }

      <!-- Reply Modal -->
      @if (showReplyModal) {
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
      font-size: 0.875rem;
    }
    .table td {
      vertical-align: middle;
    }
  `]
})
export class ServiceRequestsComponent implements OnInit {
  serviceRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  statusFilter: string = 'all';
  selectedRequest: ServiceRequest | null = null;
  showReplyModal: boolean = false;
  replyMessage: string = '';
  newStatus: string = '';

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

  openStatusModal(request: ServiceRequest) {
    this.selectedRequest = request;
    this.newStatus = request.status;
  }

  closeStatusModal() {
    this.selectedRequest = null;
    this.newStatus = '';
  }

  updateStatus() {
    if (this.selectedRequest && this.newStatus) {
      this.serviceService.updateServiceRequestStatus(this.selectedRequest.id, this.newStatus as any).subscribe({
        next: () => {
          this.selectedRequest!.status = this.newStatus as any;
          this.filterRequests();
          this.closeStatusModal();
        },
        error: (error) => {
          console.error('Error updating request status:', error);
        }
      });
    }
  }

  openReplyModal(request: ServiceRequest) {
    this.selectedRequest = request;
    this.showReplyModal = true;
    this.replyMessage = '';
  }

  closeReplyModal() {
    this.selectedRequest = null;
    this.showReplyModal = false;
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