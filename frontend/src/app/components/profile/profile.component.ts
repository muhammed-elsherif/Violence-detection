import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ServiceService, Model } from "../../core/services/service.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  loading = true;
  history: any[] = [];
  user: any;

  constructor(
    private serviceService: ServiceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.serviceService.getUser().subscribe((user) => {
      this.user = user;
    });
    this.loadHistory();
  }

  loadHistory() {
    this.serviceService.getHistory().subscribe((history) => {
      this.history = history;
    });
  }

  goToMyModels() {
    this.router.navigate(["/my-models"]);
  }
}
