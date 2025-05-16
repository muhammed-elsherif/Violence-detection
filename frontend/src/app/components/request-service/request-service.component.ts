import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-request-service',
  templateUrl: './request-service.component.html',
  styleUrls: ['./request-service.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass]
})
export class RequestServiceComponent implements OnInit {
  requestForm: FormGroup;
  availableModels: any[] = []; // This will be populated from a service
  selectedModels: string[] = [];
  isProcessing = false;
  showPaymentIframe = false;
  paymentIframeUrl = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private paymentService: PaymentService
  ) {
    this.requestForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: ['', Validators.required],
      useCase: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      requirements: ['', Validators.required],
      // Billing information
      street: ['', Validators.required],
      building: ['', Validators.required],
      floor: [''],
      apartment: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load available models from service
    this.loadAvailableModels();
  }

  loadAvailableModels(): void {
    // TODO: Implement service call to get available models
    this.availableModels = [
      { id: 1, name: 'Violence Detection Model', description: 'Real-time violence detection in video streams', price: 1000 },
      { id: 2, name: 'Object Detection Model', description: 'Advanced object detection and tracking', price: 1500 },
      // Add more models
    ];
  }

  onModelSelect(modelId: string): void {
    const index = this.selectedModels.indexOf(modelId);
    if (index === -1) {
      this.selectedModels.push(modelId);
    } else {
      this.selectedModels.splice(index, 1);
    }
  }

  calculateTotal(): number {
    return this.selectedModels.reduce((total, modelId) => {
      const model = this.availableModels.find(m => m.id.toString() === modelId);
      return total + (model?.price || 0);
    }, 0);
  }

  async onSubmit(): Promise<void> {
    if (this.requestForm.valid && this.selectedModels.length > 0) {
      this.isProcessing = true;

      try {
        const totalAmount = this.calculateTotal();
        const [firstName, ...lastNameParts] = this.requestForm.get('contactName')?.value.split(' ') || [];
        const lastName = lastNameParts.join(' ');

        const paymentRequest = {
          amount: totalAmount,
          currency: 'EGP',
          orderId: Date.now().toString(), // Generate a unique order ID
          billingData: {
            email: this.requestForm.get('email')?.value,
            first_name: firstName,
            last_name: lastName,
            phone_number: this.requestForm.get('phone')?.value,
            apartment: this.requestForm.get('apartment')?.value,
            floor: this.requestForm.get('floor')?.value,
            street: this.requestForm.get('street')?.value,
            building: this.requestForm.get('building')?.value,
            shipping_method: 'NO_SHIPPING',
            postal_code: this.requestForm.get('postalCode')?.value,
            city: this.requestForm.get('city')?.value,
            country: this.requestForm.get('country')?.value,
            state: this.requestForm.get('state')?.value
          }
        };

        const paymentResponse = await firstValueFrom(this.paymentService.initiatePayment(paymentRequest));
        if (paymentResponse) {
          this.paymentIframeUrl = paymentResponse.iframe_url;
          this.showPaymentIframe = true;
        } else {
          throw new Error('No payment response received');
        }
      } catch (error) {
        console.error('Payment initiation failed:', error);
        // Handle error (show error message to user)
      } finally {
        this.isProcessing = false;
      }
    }
  }

  onPaymentComplete(event: any): void {
    if (event.success) {
      // Handle successful payment
      this.router.navigate(['/user/my-models']);
    } else {
      // Handle failed payment
      this.showPaymentIframe = false;
      // Show error message to user
    }
  }
} 