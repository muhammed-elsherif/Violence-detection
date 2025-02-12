import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { BodyComponent } from "../body/body.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, BodyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
