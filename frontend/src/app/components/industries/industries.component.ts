import { Component } from "@angular/core";

@Component({
  selector: "app-industries",
  imports: [],
  templateUrl: "./industries.component.html",
  styleUrl: "./industries.component.scss",
})
export class IndustriesComponent {
  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
