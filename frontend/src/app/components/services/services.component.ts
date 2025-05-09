import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-services",
  imports: [RouterLink],
  templateUrl: "./services.component.html",
  styleUrl: "./services.component.scss",
})
export class ServicesComponent {
  searchQuery: string = "";

  models = [
    {
      id: 1,
      name: "Fire Detection",
      type: "CV",
      description: "Detect fire incidents in real-time video feed.",
      endpoint: "/api/models/fire-detection",
    },
    {
      id: 2,
      name: "Object Tracking",
      type: "CV",
      description: "Track the movement of objects in a video.",
      endpoint: "/api/models/object-tracking",
    },
  ];
}
