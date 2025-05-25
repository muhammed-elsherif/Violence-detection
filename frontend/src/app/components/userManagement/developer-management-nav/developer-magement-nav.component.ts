import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { User } from "../../../core/interfaces/iall-users";
import { UserAdminService } from "../../../core/services/user-admin.service";
import { Subscription } from "rxjs";
import { FormsModule } from "@angular/forms";
import { ServiceService } from "../../../core/services/service.service";

@Component({
  selector: "app-developer-magement-nav",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: "./developer-magement-nav.component.html",
  styleUrl: "./developer-magement-nav.component.scss",
})
export class DeveloperMagementNavComponent {
  developers: User[] = []; 

  searchTerm: string = "";

  private subscription = new Subscription();

  private readonly userAdminService = inject(UserAdminService);

  get filteredUsers(): User[] {
    if (!this.searchTerm.trim()) return this.developers;
    return this.developers.filter((user) =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deactivateUser(userId: string) {
    console.log("User deactivated successfully.");
    const sub = this.userAdminService.deactivateUser(userId).subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully deactivated user:",
          "color: green; font-weight: bold;",
          res
        );
        this.uploadUserStats();
      },
      error: (err) => {
        console.error(
          "%c[User Stats] Failed to deactivate user:",
          "color: red; font-weight: bold;",
          err
        );
      },
    });
    this.subscription.add(sub);
  }

  deleteUser(userId: string) {
    console.log("User deleted successfully.");

    const sub = this.userAdminService.deleteUser(userId).subscribe({
      next: (res) => {
        this.uploadUserStats();
      },
      error: (err) => {
        console.error(
          "%c[User Stats] Failed to delete user:",
          "color: red; font-weight: bold;",
          err
        );
      },
    });
    this.subscription.add(sub);
  }

  activateUser(userId: string) {
    console.log(userId);

    const sub = this.userAdminService.activateUser(userId).subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully activated user:",
          "color: green; font-weight: bold;",
          res
        );
        this.uploadUserStats();
      },
      error: (err) =>
        console.error(
          "%c[User Stats] Failed to activate user:",
          "color: red; font-weight: bold;",
          err
        ),
    });

    this.subscription.add(sub);
  }

  uploadUserStats(): void {
    const sub = this.serviceService.getDevelopers().subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully fetched user stats:",
          "color: green; font-weight: bold;",
          res
        );
        this.developers = res;
      },
      error: (err) =>
        console.error(
          "%c[User Stats] Failed to fetch user stats:",
          "color: red; font-weight: bold;",
          err
        ),
    });

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log(
      "%c[User Stats] 🔄 Component destroyed — subscriptions cleaned up.",
      "color: orange; font-style: italic;"
    );
  }

  constructor(private serviceService: ServiceService) {
    this.uploadUserStats();
  }
}
