import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-service',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './request-service.component.html',
  styleUrl: './request-service.component.scss'
})
export class RequestServiceComponent {
  requestForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      serviceName: ['', Validators.required],
      serviceDescription: ['', Validators.required],
      serviceCategory: ['', Validators.required],
      useCase: ['', Validators.required],
      requirements: ['', Validators.required],
      timeline: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.serviceService.createServiceRequest(this.requestForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.requestForm.reset();
          this.router.navigate(['/services']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error.message || 'An error occurred while submitting your request';
        }
      });
    }
  }
} 