import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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
      
      // TODO: Implement service call to upload model and save service details
      console.log('Service form submitted:', this.serviceForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.serviceForm.reset();
        // Show success message
      }, 2000);
    }
  }
} 