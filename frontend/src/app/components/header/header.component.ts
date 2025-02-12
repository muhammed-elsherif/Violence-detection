import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee, faPlay, faSearch, faAngleDown} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  faCoffee = faCoffee;
  faPlay = faPlay;
  faSearch = faSearch;
  faAngleDown = faAngleDown;
}
