import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { UserAdminService } from "../../core/services/user-admin.service";
import { DatePipe} from "@angular/common";
import { Subscription } from "rxjs";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [DatePipe],
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.scss",
})
export class UsersComponent implements OnInit, OnDestroy {
  userStats: any[] = [];
  private subscription = new Subscription();

  private readonly userAdminService = inject(UserAdminService);

  ngOnInit(): void {
    this.uploadUserStats();
  }

  uploadUserStats(): void {
    const sub = this.userAdminService.getUserStats().subscribe({
      next: (response) => {
        console.log(
          "%c[User Stats] Successfully fetched user stats:",
          "color: green; font-weight: bold;",
          response
        );
        this.userStats = response;
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
