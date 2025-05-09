import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-body',
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss'
})
export class BodyComponent {
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendar = faCalendar;
  faChevronRight = faChevronRight;
}
