import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService, Model } from '../../core/services/service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-model',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchase-model.component.html',
  styleUrls: ['./purchase-model.component.scss'],
})
export class PurchaseModelComponent implements OnInit {
  purchaseForm: FormGroup;
  availableModels: Model[] = [];
  selectedModels: number[] = [];
  isProcessing = false;
  error: string | null = null;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router
  ) {
    this.purchaseForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      street: ['', Validators.required],
      building: [''],
      floor: [''],
      apartment: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAvailableModels();
  }

  loadAvailableModels() {
    this.loading = true;
    this.error = null;

    this.serviceService.getAllServices().subscribe({
      next: (models) => {
        this.availableModels = models;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load available models. Please try again later.';
        this.loading = false;
        console.error('Error loading models:', error);
      }
    });
  }

  onModelSelect(modelId: number) {
    const index = this.selectedModels.indexOf(modelId);
    if (index === -1) {
      this.selectedModels.push(modelId);
    } else {
      this.selectedModels.splice(index, 1);
    }
  }

  calculateTotal(): number {
    return this.selectedModels.reduce((total, modelId) => {
      const model = this.availableModels.find(m => m.id === modelId);
      return total + (model?.price || 0);
    }, 0);
  }

  onSubmit() {
    if (this.purchaseForm.valid && this.selectedModels.length > 0) {
      this.isProcessing = true;
      this.error = null;
      
      const purchaseData = {
        ...this.purchaseForm.value,
        modelIds: this.selectedModels
      };

      this.serviceService.purchaseModel(purchaseData).subscribe({
        next: () => {
          this.isProcessing = false;
          this.router.navigate(['/my-models']);
        },
        error: (error) => {
          this.isProcessing = false;
          this.error = error.error.message || 'Failed to process purchase. Please try again later.';
          console.error('Error purchasing models:', error);
        }
      });
    }
  }
} 