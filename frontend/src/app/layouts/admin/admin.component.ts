import { Component } from '@angular/core';
import { AdminNavComponent } from "../../components/admin-nav/admin-nav.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [AdminNavComponent , RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

}
