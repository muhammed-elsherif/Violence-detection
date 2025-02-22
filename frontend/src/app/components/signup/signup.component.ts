import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly _AuthService = inject(AuthService);

  signupForm: FormGroup = new FormGroup({
    role: new FormControl('Admin'),
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\w{6,}$/),
    ]),
  });

  onSubmit(): void {
    if (this.signupForm.valid) {
      this._AuthService.setSignupForm(this.signupForm.value).subscribe({
        next: (res) => {
          // action
          console.log(res);
        },
        error: (err) => {
          // display error message
          console.log(err);
        },
      });
      // console.log(this.loginForm.value);
    }
  }
}
