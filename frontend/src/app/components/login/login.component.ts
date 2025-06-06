import { Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private readonly _AuthService = inject(AuthService);
  private readonly Router = inject(Router);

  error: string = "";
  isSubmitting: boolean = false;
  isLoggedIn: boolean = localStorage.getItem("access_token") ? true : false;

  constructor() {
    if (this.isLoggedIn) {
      // this.redirectBasedOnRole();
      this.Router.navigate(["/"]);
    }
  }

  loginForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.pattern(/^\w{6,}$/),
    ]),
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this._AuthService.setLoginForm(this.loginForm.value).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.Router.navigate(["/"]);
          // this.redirectBasedOnRole();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.error?.message || "An error occurred during login.";
        },
      });
    }
  }

  private redirectBasedOnRole(): void {
    const role = this._AuthService.getUserRole();
    switch (role) {
      case "ADMIN":
        this.Router.navigate(["/admin"]);
        break;
      case "DEVELOPER":
        this.Router.navigate(["/developer/assigned-tasks"]);
        break;
      default:
        this.Router.navigate(["/user"]);
    }
  }
}
