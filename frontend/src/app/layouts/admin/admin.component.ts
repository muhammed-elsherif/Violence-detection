import { Component, inject } from "@angular/core";
import { AdminNavComponent } from "../../components/admin-nav/admin-nav.component";
import { Router } from "@angular/router";
import { NotificationsComponent } from "../../components/notifications/notifications.component";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [AdminNavComponent, NotificationsComponent],
  template: `
    <app-notifications></app-notifications>
    <app-admin-nav></app-admin-nav>
  `,
})
export class AdminComponent {
  private readonly Router = inject(Router);

  isLoggedIn: boolean = localStorage.getItem("access_token") ? true : false;
  constructor() {
    if (!this.isLoggedIn) {
      this.Router.navigate(["/login"]);
    }
  }
}
