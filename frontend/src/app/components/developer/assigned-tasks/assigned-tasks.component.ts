import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-assigned-tasks",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./assigned-tasks.component.html",
  // styleUrl: "./assigned-tasks.component.scss",
})
export class AssignedTasksComponent {
  private readonly _AuthService = inject(AuthService);
  private assignedTasks: any[] = [];
  private developerId: string = "";

  ngOnInit(): void {
    console.log("Assigned Tasks Component");
    // this._AuthService.getDeveloperTasks(this.developerId).subscribe({
    //   next: (tasks) => {
    //     this.assignedTasks = tasks;
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
  }
}
