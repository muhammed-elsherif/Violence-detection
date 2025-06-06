import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data["role"];
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(["/login"]);
      return false;
    }

    if (userRole !== expectedRole) {
      switch (userRole) {
        case "ADMIN":
          this.router.navigate(["/admin"]);
          break;
        case "DEVELOPER":
          this.router.navigate(["/developer"]);
          break;
        default:
          this.router.navigate(["/"]);
      }
      return false;
    }

    return true;
  }
}
