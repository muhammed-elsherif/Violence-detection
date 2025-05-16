import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common'; // Add this import
import { RouterOutlet } from '@angular/router';
@Component({
  selector: "app-admin-nav",
  imports: [RouterLink, RouterLinkActive, NgClass, RouterOutlet],
  templateUrl: "./admin-nav.component.html",
  styleUrl: "./admin-nav.component.scss",
})
export class AdminNavComponent {
  isCollapsed = false;

  items = [
    { label: "Analytics", icon: "fas fa-chart-pie", routeLink: "/admin/analytics" },
    { label: "Users", icon: "fas fa-users", routeLink: "/admin/user-magement-nav" },
    { label: "Service Requests", icon: "fas fa-tasks", routeLink: "/admin/service-requests" },
    { label: "Settings", icon: "fas fa-cogs", routeLink: "/admin/settings" },
    { label: "Reports", icon: "fas fa-chart-bar", routeLink: "/admin/reports" },
  ];

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  closeSidenav(): void {
    this.isCollapsed = true;
  }

  isLeftSidebarCollapsed(): boolean {
    return this.isCollapsed;
  }

  logout(): void {
    console.log("Logout clicked");
    // Example: this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
