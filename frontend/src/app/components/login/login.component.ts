import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly _AuthService = inject(AuthService);
  private readonly Router = inject(Router);

  error: string = '';
  isSubmitting: boolean = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\w{6,}$/),
    ]),
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this._AuthService.setLoginForm(this.loginForm.value).subscribe({
        next: (response) => {
            this.Router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.error?.message || 'An error occurred during registration.';
        }
      });
    }
  }
}

// if (this.loginForm.valid) {
//   this._AuthService.setLoginForm(this.loginForm.value).subscribe({
//     next: (res) => {
//       // action
//       console.log(res);
//     },
//     error: (err) => {
//       // display error message
//       console.log(err);
//     },
//   });
//   // console.log(this.loginForm.value);
// }
