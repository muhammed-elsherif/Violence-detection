import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { UserAdminService } from "../../core/services/user-admin.service";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { IUser } from "../../core/interfaces/iall-users";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.scss",
})
export class UsersComponent {
  userStats: IUser[] = [];
  searchTerm: string = "";

  get filteredUsers(): IUser[] {
    if (!this.searchTerm.trim()) return this.userStats;
    return this.userStats.filter((user) =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private subscription = new Subscription();

  private readonly userAdminService = inject(UserAdminService);

  ngOnInit(): void {
    this.uploadUserStats();
    // this.userStats = [
    //   {
    //     id: "b2c9c230-bb45-4e1a-8049-90ea2e6bdc84",
    //     username: "youssef",
    //     email: "youssef@example.com",
    //     role: "USER",
    //     isActive: true,
    //     createdAt: new Date("2025-04-25T23:20:50.52Z"),
    //     updatedAt: new Date("2025-04-25T23:20:50.52Z"),
    //   },
    //   {
    //     id: "b2c9c230-bb45-4e1a-8049-90ea2e6bdc84",
    //     username: "youssef",
    //     email: "youssef@example.com",
    //     role: "USER",
    //     isActive: false,
    //     createdAt: new Date("2025-04-25T23:20:50.52Z"),
    //     updatedAt: new Date("2025-04-25T23:20:50.52Z"),
    //   },
    //   {
    //     id: "b2c9c230-bb45-4e1a-8049-90ea2e6bdc84",
    //     username: "youssef",
    //     email: "youssef@example.com",
    //     role: "USER",
    //     isActive: false,
    //     createdAt: new Date("2025-04-25T23:20:50.52Z"),
    //     updatedAt: new Date("2025-04-25T23:20:50.52Z"),
    //   },
    //   {
    //     id: "b2c9c230-bb45-4e1a-8049-90ea2e6bdc84",
    //     username: "youssef",
    //     email: "youssef@example.com",
    //     role: "USER",
    //     isActive: false,
    //     createdAt: new Date("2025-04-25T23:20:50.52Z"),
    //     updatedAt: new Date("2025-04-25T23:20:50.52Z"),
    //   },
    //   {
    //     id: "b2c9c230-bb45-4e1a-8049-90ea2e6bdc84",
    //     username: "NASSER",
    //     email: "youssef@example.com",
    //     role: "USER",
    //     isActive: false,
    //     createdAt: new Date("2025-04-25T23:20:50.52Z"),
    //     updatedAt: new Date("2025-04-25T23:20:50.52Z"),
    //   },
    //   {
    //     id: "b2c9c230-bb45-4e1a-8049-90ea2e6bdc84",
    //     username: "youssef",
    //     email: "youssef@example.com",
    //     role: "USER",
    //     isActive: false,
    //     createdAt: new Date("2025-04-25T23:20:50.52Z"),
    //     updatedAt: new Date("2025-04-25T23:20:50.52Z"),
    //   },
    // ];
  }

  deactivateUser() {
    console.log("User deactivated successfully.");
  }

  deleteUser() {
    console.log("User deleted successfully.");
  }
  activateUser() {
    console.log("User activated successfully.");
  }

  uploadUserStats(): void {
    const sub = this.userAdminService.getUserStats().subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully fetched user stats:",
          "color: green; font-weight: bold;",
          res
        );
        this.userStats = res;
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
}
