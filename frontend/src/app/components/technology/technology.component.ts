import { Component } from '@angular/core';

@Component({
  selector: 'app-technology',
  imports: [],
  templateUrl: './technology.component.html',
  styleUrl: './technology.component.scss'
})
export class TechnologyComponent {
  selectedFiles: File[] = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }
}
