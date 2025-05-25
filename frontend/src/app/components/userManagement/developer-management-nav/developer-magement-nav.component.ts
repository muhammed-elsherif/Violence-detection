import { Component, inject } from "@angular/core";
import { User } from "../../../core/interfaces/iall-users";
import { Subscription } from "rxjs";
import { FormsModule } from "@angular/forms";
import { ServiceService } from "../../../core/services/service.service";
import { NgClass } from "@angular/common";
import { DeveloperAdminService } from "../../../core/services/developer-admin.service";

@Component({
  selector: "app-developer-magement-nav",
  imports: [FormsModule, NgClass],
  templateUrl: "./developer-magement-nav.component.html",
  styleUrl: "./developer-magement-nav.component.scss",
})
export class DeveloperMagementNavComponent {
  developers: User[] = [];

  searchTerm: string = "";

  private subscription = new Subscription();

  private readonly developerAdminService = inject(DeveloperAdminService);

  get filteredUsers(): User[] {
    if (!this.searchTerm.trim()) return this.developers;
    return this.developers.filter((user) =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deactivateUser(userId: string) {
    const sub = this.developerAdminService
      .deactivateDeveloper(userId)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.getDevelopers();
        },
        error: (err) => {
          console.error(err);
        },
      });
    this.subscription.add(sub);
  }

  deleteUser(userId: string) {
    const sub = this.developerAdminService.deleteDeveloper(userId).subscribe({
      next: (res) => {
        this.getDevelopers();
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.subscription.add(sub);
  }

  activateUser(userId: string) {
    const sub = this.developerAdminService.activateDeveloper(userId).subscribe({
      next: (res) => {
        console.log(res);
        this.getDevelopers();
      },
      error: (err) => console.error(err),
    });

    this.subscription.add(sub);
  }

  getDevelopers(): void {
    const sub = this.serviceService.getDevelopers().subscribe({
      next: (res) => {
        console.log(res);
        this.developers = res;
      },
      error: (err) => console.error(err),
    });

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  constructor(private serviceService: ServiceService) {
    this.getDevelopers();
  }
}
