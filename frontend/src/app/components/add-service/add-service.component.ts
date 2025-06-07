import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class AddServiceComponent implements OnInit {
  serviceForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      features: ['', Validators.required],
      requirements: ['', Validators.required],
      endpoint: ['', Validators.required],
      modelFile: [null, Validators.required],
      demoVideo: [''],
      documentation: [''],
      isPublic: [false],
      supportedPlatforms: this.fb.group({
        windows: [false],
        macos: [false],
        linux: [false]
      })
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any, field: string): void {
    const file = event.target.files[0];
    if (file) {
      this.serviceForm.patchValue({
        [field]: file
      });
    }
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.serviceForm.value;
      
      // Convert price to number
      const serviceData = {
        ...formValue,
        price: Number(formValue.price)
      };

      this.serviceService.createService(serviceData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.serviceForm.reset();
          this.router.navigate(['/services']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error.message || 'An error occurred while creating the service';
        }
      });
    }
  }
} 