import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../services/service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  standalone: true,
  styleUrls: ['./add-service.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, NgClass]
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
      modelFile: [null, Validators.required],
      demoVideo: [null],
      documentation: [null],
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

      const formData = new FormData();
      const formValue = this.serviceForm.value;

      // Append all form fields to FormData
      Object.keys(formValue).forEach(key => {
        if (key === 'supportedPlatforms') {
          formData.append(key, JSON.stringify(formValue[key]));
        } else {
          formData.append(key, formValue[key]);
        }
      });

      this.serviceService.createService(formData).subscribe({
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