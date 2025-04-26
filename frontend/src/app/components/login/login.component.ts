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

  loginForm: FormGroup = new FormGroup({
    role: new FormControl('Admin'),
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
          console.log('Signup successful:', response);
          const { role } = this.loginForm.value;
          
          if (role === 'User') {
            this.Router.navigate(['/user']);
          } else if (role === 'Admin') {
            this.Router.navigate(['/admin']);
          }
        },
        error: (error) => {
          console.error('Signup failed:', error);
          // Handle error (show error message to user)
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
