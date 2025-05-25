import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, Router } from "@angular/router";

@Component({
  selector: "app-navbar",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {
  private readonly Router = inject(Router);

  onSubmit(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.Router.navigate(["/login"]);
  }
}
