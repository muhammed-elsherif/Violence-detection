import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-object',
  imports: [],
  templateUrl: './object.component.html',
  styleUrl: './object.component.scss'
})

export class ObjectComponent implements AfterViewInit {
    @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  
    ngAfterViewInit(): void {
      this.startCamera();
    }
  
    startCamera(): void {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.video.nativeElement.srcObject = stream;
        })
        .catch(err => {
          console.error('Error accessing webcam: ', err);
        });
    }  
}
