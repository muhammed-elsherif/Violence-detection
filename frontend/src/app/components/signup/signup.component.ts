import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly _AuthService = inject(AuthService);
  private readonly Router = inject(Router);
  error: string = '';
  username: string = '';
  passwordMatch: boolean = true;
  isSubmitting: boolean = false;

  isLoggedIn: boolean = localStorage.getItem("access_token") ? true : false;
  constructor() {
    if (this.isLoggedIn) {
      this.Router.navigate(["/"]);
    }
  }

  signupForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    surname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\w{6,}$/),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
    terms: new FormControl(false, [Validators.requiredTrue]),
  });

  onSubmit(): void {
    this.passwordMatch = true;
    
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      const { name, surname, email, password, confirmPassword } = this.signupForm.value;

      if (password !== confirmPassword) {
        this.passwordMatch = false;
        this.error = 'Passwords do not match.';
        this.isSubmitting = false;
        return;
      }

      this.username = name + " " + surname;
      this._AuthService.setSignupForm({ username: this.username, email, password }).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.Router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.error?.message || 'An error occurred during registration.';
        },
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
    }
  }
}
