import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-magement-nav',
  imports: [RouterOutlet , RouterLink , RouterLinkActive ],
  templateUrl: './user-magement-nav.component.html',
  styleUrl: './user-magement-nav.component.scss'
})
export class UserMagementNavComponent {
}