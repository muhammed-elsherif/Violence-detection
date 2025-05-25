import { UserAdminService } from "./../../../core/services/user-admin.service";
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
  private readonly _UserAdminService = inject(UserAdminService);

  createUserForm: FormGroup;
  createUserSub!: Subscription;

  constructor(private formBuilder: FormBuilder) {
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
      role: [null, [Validators.required]],
    });
  }

  createUserSubmit() {
    if (this.createUserForm.valid) {
      this.createUserSub = this._UserAdminService
        .createUser(this.createUserForm.value)
        .subscribe({
          next: (res) => {
            console.log("User created successfully", res);
            this.createUserForm.reset();
          },
          error: (err) => {
            console.error("Error creating user", err);
          },
        });
    } else {
      this.createUserForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
    }
  }
}
