import { Component, inject, OnInit } from "@angular/core";
import { UserAdminService } from "../../core/services/user-admin.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [DatePipe],
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.scss",
})
export class UsersComponent implements OnInit {
  userStats: any[] = [];

  userAdminService = inject(UserAdminService);

  ngOnInit(): void {
    this.uploadUserStats();
  }

  uploadUserStats() {
    this.userAdminService.getUserStats().subscribe({
      next: (response) => {
        console.log("Upload success:", response);
        this.userStats = response;
      },
      error: (err) => console.error("Upload error:", err),
    });
  }
}
