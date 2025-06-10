import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ServiceService, Model } from "../../core/services/service.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-purchase-model",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./purchase-model.component.html",
  styleUrls: ["./purchase-model.component.scss"],
})
export class PurchaseModelComponent implements OnInit {
  purchaseForm: FormGroup;
  availableModels: Model[] = [];
  selectedModels: number[] = [];
  isProcessing = false;
  error: string | null = null;
  loading = true;
  recommendedModelResponse: any;
  explanation: string | null = null;
  models: string[] = [];
  isShowOtherModels = false;
  isGenerating = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router
  ) {
    this.purchaseForm = this.fb.group({
      companyName: ["", Validators.required],
      industry: ["", Validators.required],
      contactName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      contactNumber: ["", Validators.required],
      address: ["", Validators.required],
      city: ["", Validators.required],
      state: ["", Validators.required],
      country: ["", Validators.required],
      postalCode: ["", Validators.required],
    });
  }

  askAiForm: FormGroup = new FormGroup({
    company_name: new FormControl(null),
    use_case: new FormControl(null),
  });

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
        this.error = "Failed to load available models. Please try again later.";
        this.loading = false;
        console.error("Error loading models:", error);
      },
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
      const model = this.availableModels.find((m) => m.id === modelId);
      return total + (model?.price || 0);
    }, 0);
  }

  onSubmit() {
    if (this.purchaseForm.valid && this.selectedModels.length > 0) {
      this.isProcessing = true;
      this.error = null;

      const purchaseData = {
        ...this.purchaseForm.value,
        purchasedModels: this.selectedModels,
      };

      this.serviceService.purchaseModel(purchaseData).subscribe({
        next: () => {
          this.isProcessing = false;
          this.router.navigate(["/my-models"]);
        },
        error: (error) => {
          this.isProcessing = false;
          this.error =
            error.error.message ||
            "Failed to process purchase. Please try again later.";
          console.error("Error purchasing models:", error);
        },
      });
    }
  }

  showAskAi() {
    const overlay = document.getElementById("ai-overlay");
    if (overlay) {
      overlay.classList.remove("d-none");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
      document
        .querySelector(".form-container")
        ?.classList.add("recommendation-open");
    }
  }

  closeAskAi() {
    const overlay = document.getElementById("ai-overlay");
    if (overlay) {
      overlay.classList.add("d-none");
      document.body.style.overflow = ""; // Restore background scrolling
      document
        .querySelector(".form-container")
        ?.classList.remove("recommendation-open");
    }
    this.askAiForm.reset();
    this.isShowOtherModels = false;
    this.recommendedModelResponse = null;
    this.explanation = null;
    this.models = [];
  }

  askAiSubmit() {
    this.isGenerating = true;
    if (this.askAiForm.valid) {
      const formData = this.askAiForm.value;
      this.serviceService.getRecommendedModel(formData).subscribe({
        next: (response) => {
          this.recommendedModelResponse = response.recommended_model;
          this.explanation = response.explanation;
          this.models = response.models;
          this.isGenerating = false;
        },
        error: (error) => {
          this.error =
            error.error.message ||
            "Failed to get recommended model. Please try again later.";
          this.isGenerating = false;
        },
      });
    }
  }

  showOtherModels() {
    this.isShowOtherModels = true;
  }
}
