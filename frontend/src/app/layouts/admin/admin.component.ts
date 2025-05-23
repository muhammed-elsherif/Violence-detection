import { Component } from "@angular/core";
import { AdminNavComponent } from "../../components/admin-nav/admin-nav.component";
import { RouterOutlet } from "@angular/router";
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
export class AdminComponent {}
