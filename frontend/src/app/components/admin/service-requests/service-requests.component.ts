import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ServiceService } from "../../../core/services/service.service";
import { DeveloperAdminService } from "../../../core/services/developer-admin.service";

interface ServiceRequest {
  id: string;
  serviceName: string;
  serviceDescription: string;
  serviceCategory: string;
  userId: string;
  status: "PENDING" | "IN_PROGRESS" | "WAITING_FOR_INFO" | "COMPLETED";
  developer: {
    name: string;
    id: string;
  };
  useCase: string;
  specificRequirements: string;
  expectedTimeline: string;
  budget: number;
  createdAt: Date;
  user: {
    email: string;
    username: string;
  };
}

interface Developer {
  id: string;
  username: string;
}

@Component({
  selector: "app-service-requests",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h2>Service Requests</h2>

      <!-- Status Filter -->
      <div class="mb-4">
        <select
          class="form-select w-auto"
          [(ngModel)]="statusFilter"
          (change)="filterRequests()"
        >
          <option value="all">All Requests</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_INFO">Waiting for Info</option>
          <option value="COMPLETED">Completed</option>
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
              <td>{{ request.user.username }}</td>
              <td>{{ request.serviceName }}</td>
              <td>{{ request.serviceCategory }}</td>
              <td>{{ request.serviceDescription }}</td>
              <td>
                <span
                  class="badge"
                  [ngClass]="{
                    'bg-warning': request.status === 'PENDING',
                    'bg-info': request.status === 'IN_PROGRESS',
                    'bg-danger': request.status === 'WAITING_FOR_INFO',
                    'bg-success': request.status === 'COMPLETED'
                  }"
                >
                  {{ request.status | titlecase }}
                </span>
              </td>
              <td>{{ request.createdAt | date : "medium" }}</td>
              <td>
                <div class="btn-group">
                  <button
                    class="btn btn-sm btn-primary me-2"
                    (click)="openRequestDetails(request)"
                  >
                    Show Details
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
              <button
                type="button"
                class="btn-close"
                (click)="closeStatusModal()"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">New Status</label>
                <select class="form-select" [(ngModel)]="newStatus">
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_FOR_INFO">Waiting for Info</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Developer</label>
                <select class="form-select" [(ngModel)]="selectedDeveloperId">
                  @for (developer of developers; track developer.id) {
                  <option value="{{ developer.id }}">
                    {{ developer.username }}
                  </option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="closeStatusModal()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                (click)="updateStatus()"
              >
                Update Status
              </button>
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
              <button
                type="button"
                class="btn-close"
                (click)="closeReplyModal()"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Message</label>
                <textarea
                  class="form-control"
                  rows="4"
                  [(ngModel)]="replyMessage"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="closeReplyModal()"
              >
                Close
              </button>
              <button
                type="button"
                class="btn btn-primary"
                (click)="sendReply()"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
      }

      <!-- Request Details Modal -->
      @if (showRequestDetailsModal) {
      <div class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Request Details</h5>
              <button
                type="button"
                class="btn-close"
                (click)="closeRequestDetailsModal()"
              ></button>
            </div>
            <div class="modal-body">
              <p>
                <strong>User:</strong>
                {{ selectedRequest?.user?.username || "N/A" }}
              </p>
              <p>
                <strong>Service Name:</strong>
                {{ selectedRequest?.serviceName }}
              </p>
              <p>
                <strong>Category:</strong>
                {{ selectedRequest?.serviceCategory }}
              </p>
              <p>
                <strong>Description:</strong>
                {{ selectedRequest?.serviceDescription }}
              </p>
              <p>
                <strong>Status:</strong>
                {{ selectedRequest?.status | titlecase }}
              </p>
              <p><strong>Use Case:</strong> {{ selectedRequest?.useCase }}</p>
              <p>
                <strong>Specific Requirements:</strong>
                {{ selectedRequest?.specificRequirements }}
              </p>
              <p>
                <strong>Expected Timeline:</strong>
                {{ selectedRequest?.expectedTimeline }}
              </p>
              <p><strong>Budget:</strong> {{ selectedRequest?.budget }}</p>
              <p>
                <strong>Created At:</strong>
                {{ selectedRequest?.createdAt | date : "medium" }}
              </p>
            </div>

            <div
              class="btn-group p-3 fixed bottom-0 w-100 flex justify-center items-center bg-white border-top border-gray-200 gap-2"
            >
              <button
                class="btn btn-md btn-warning flex-1"
                (click)="selectedRequest && openStatusModal(selectedRequest)"
              >
                Change Status
              </button>
              <button
                class="btn btn-md btn-info flex-1"
                (click)="selectedRequest && openReplyModal(selectedRequest)"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
      }
    </div>
  `,
  styles: [
    `
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
    `,
  ],
})
export class ServiceRequestsComponent implements OnInit {
  serviceRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  statusFilter: string = "all";
  selectedRequest: ServiceRequest | null = null;
  showReplyModal: boolean = false;
  replyMessage: string = "";
  newStatus: string = "";
  selectedDeveloperId: string = "";
  developers: Developer[] = [];
  showRequestDetailsModal: boolean = false;
  constructor(
    private serviceService: ServiceService,
    private developerAdminService: DeveloperAdminService
  ) {}

  ngOnInit() {
    // cache developers
    this.developers = JSON.parse(localStorage.getItem("developers") || "[]");
    this.loadServiceRequests();
    this.loadDevelopers();
  }

  loadServiceRequests() {
    this.serviceService.getAllServiceRequests().subscribe({
      next: (requests) => {
        this.serviceRequests = requests;
        this.filterRequests();
      },
      error: (error) => {
        console.error("Error loading service requests:", error);
      },
    });
  }

  loadDevelopers() {
    this.developerAdminService.getDevelopers().subscribe({
      next: (developers) => {
        this.developers = developers;
        localStorage.setItem("developers", JSON.stringify(developers));
      },
      error: (error) => {
        console.error("Error loading developers:", error);
      },
    });
  }

  filterRequests() {
    if (this.statusFilter === "all") {
      this.filteredRequests = this.serviceRequests;
    } else {
      this.filteredRequests = this.serviceRequests.filter(
        (request) => request.status === this.statusFilter
      );
    }
  }

  openStatusModal(request: ServiceRequest) {
    this.selectedRequest = request;
    this.newStatus = request.status;
    this.selectedDeveloperId = request.developer.id;
    this.showReplyModal = false;
    this.showRequestDetailsModal = false;
  }

  closeStatusModal() {
    this.selectedRequest = null;
    this.newStatus = "";
    this.selectedDeveloperId = "";
  }

  updateStatus() {
    if (this.selectedRequest && this.newStatus) {
      this.serviceService
        .updateServiceRequestStatus(
          this.selectedRequest.id,
          this.newStatus as any,
          this.selectedDeveloperId as string
        )
        .subscribe({
          next: () => {
            this.selectedRequest!.status = this.newStatus as any;
            this.selectedRequest!.developer.id = this.selectedDeveloperId;
            this.filterRequests();
            this.closeStatusModal();
          },
          error: (error) => {
            console.error("Error updating request status:", error);
          },
        });
    }
  }

  openReplyModal(request: ServiceRequest) {
    this.selectedRequest = request;
    this.showRequestDetailsModal = false;
    this.showReplyModal = true;
    this.replyMessage = "";
  }

  closeReplyModal() {
    this.selectedRequest = null;
    this.showReplyModal = false;
    this.replyMessage = "";
  }

  sendReply() {
    if (this.selectedRequest && this.replyMessage.trim()) {
      this.serviceService
        .replyToServiceRequest(this.selectedRequest.id, this.replyMessage)
        .subscribe({
          next: () => {
            this.closeReplyModal();
          },
          error: (error) => {
            console.error("Error sending reply:", error);
          },
        });
    }
  }

  openRequestDetails(request: ServiceRequest) {
    this.selectedRequest = request;
    this.showRequestDetailsModal = true;
    this.showReplyModal = false;
  }

  closeRequestDetailsModal() {
    this.showRequestDetailsModal = false;
    this.showReplyModal = false;
    this.selectedRequest = null;
  }
}
