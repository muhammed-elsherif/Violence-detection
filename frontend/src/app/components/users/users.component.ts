import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { UserAdminService } from "../../core/services/user-admin.service";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { IUser, User } from "../../core/interfaces/iall-users";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.scss",
})
export class UsersComponent implements OnInit, OnDestroy {
  userStats: IUser[] = [];
  allUsers: User[] = [];
  searchTerm: string = "";
  loading = true;
  error: string | null = null;

  get filteredUsers(): IUser[] {
    if (!this.searchTerm.trim()) return this.userStats;
    return this.userStats.filter(
      (user) =>
        user.user.username
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        user.user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private subscription = new Subscription();
  private readonly userAdminService = inject(UserAdminService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Load user stats
    const statsSub = this.userAdminService.getUserStats().subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully fetched user stats:",
          "color: green; font-weight: bold;",
          res
        );
        this.userStats = res;
      },
      error: (err) => {
        console.error(
          "%c[User Stats] Failed to fetch user stats:",
          "color: red; font-weight: bold;",
          err
        );
        this.error = "Failed to load user statistics";
      },
    });

    // Load all users
    const usersSub = this.userAdminService.getAllUsers().subscribe({
      next: (res) => {
        console.log(
          "%c[Users] Successfully fetched all users:",
          "color: green; font-weight: bold;",
          res
        );
        this.allUsers = res;
      },
      error: (err) => {
        console.error(
          "%c[Users] Failed to fetch all users:",
          "color: red; font-weight: bold;",
          err
        );
        this.error = "Failed to load users";
      },
      complete: () => {
        this.loading = false;
      },
    });

    this.subscription.add(statsSub);
    this.subscription.add(usersSub);
  }

  deactivateUser(userId: string) {
    const sub = this.userAdminService.deactivateUser(userId).subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully deactivated user:",
          "color: green; font-weight: bold;",
          res
        );
        this.loadData();
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
    const sub = this.userAdminService.deleteUser(userId).subscribe({
      next: (res) => {
        this.loadData();
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
    const sub = this.userAdminService.activateUser(userId).subscribe({
      next: (res) => {
        console.log(
          "%c[User Stats] Successfully activated user:",
          "color: green; font-weight: bold;",
          res
        );
        this.loadData();
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log(
      "%c[User Stats] 🔄 Component destroyed — subscriptions cleaned up.",
      "color: orange; font-style: italic;"
    );
  }
}
