import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-user",
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: "./user.component.html",
  styleUrl: "./user.component.scss",
})
export class UserComponent {
  private readonly _Router = inject(Router);

  openCart() {
    this._Router.navigate(["/purchase-model"]);
  }
}
