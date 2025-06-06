import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-developer",
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="developer-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .developer-layout {
        min-height: 100vh;
        background-color: #f8f9fa;
      }
    `,
  ],
})
export class DeveloperComponent {}
