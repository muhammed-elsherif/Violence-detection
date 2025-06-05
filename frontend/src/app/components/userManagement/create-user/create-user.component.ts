import { DeveloperAdminService } from "./../../../core/services/developer-admin.service";
import { Component, inject } from "@angular/core";
import { CommonModule, NgClass } from "@angular/common";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-create-user",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  templateUrl: "./create-user.component.html",
  styleUrls: ["./create-user.component.scss"], // Corrected 'styleUrl' to 'styleUrls'
})
export class CreateDeveloperComponent {
  private readonly _UserAdminService = inject(DeveloperAdminService);

  createUserForm: FormGroup;
  createUserSub!: Subscription;
  error: string | null = null;
  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.createUserForm = this.formBuilder.group({
      username: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]],
      confirmPassword: [null, [Validators.required]],
    });
  }

  createUserSubmit() {
    if (this.createUserForm.valid) {
      this.createUserSub = this._UserAdminService
        .createDeveloper(this.createUserForm.value)
        .subscribe({
          next: (res) => {
            this.createUserForm.reset();
            this.error = null;
            this.router.navigate(["/admin/user-magement-nav/developers"]);
          },
          error: (err) => {
            this.error = err.error.message;
          },
        });
    } else {
      this.createUserForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
    }
  }
}
