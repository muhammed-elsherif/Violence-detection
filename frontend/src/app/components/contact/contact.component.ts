import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  success = false;

  contactInfo = {
    email: 'contact@violencedetection.com',
    phone: '+1 (555) 123-4567',
    address: '123 AI Street, Tech City, TC 12345',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST'
  };

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      phone: ['', [Validators.pattern('^[0-9-+() ]*$')]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.error = null;
      this.success = false;

      this.serviceService.sendContactMessage(this.contactForm.value).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.success = true;
          this.contactForm.reset();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.error = 'Failed to send message. Please try again later.';
          console.error('Error sending message:', error);
        }
      });
    }
  }
}
