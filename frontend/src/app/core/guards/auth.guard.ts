import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem("access_token");
  const authService = inject(AuthService);
  
  if (token) {
    authService.saveUserData(); // Ensure userData is decoded
    const role = authService.userData?.role;

    if (role === 'ADMIN') {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } else {
    router.navigate(['/login']);
    return false;
  }
};

