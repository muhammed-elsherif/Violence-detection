import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-places",
  imports: [],
  templateUrl: "./places.component.html",
  styleUrl: "./places.component.scss",
})
export class PlacesComponent implements OnInit {
  userLocation: any = null;
  location = { lat: 0, lng: 0 };
  videoUrl = 'http://localhost:6000/video_feed';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // this.getUserLocation();
  }

  // @ViewChild("video") video!: ElementRef<HTMLVideoElement>;

  // ngAfterViewInit(): void {
  //   this.startCamera();
  // }

  // async startCamera() {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true })
  //     .then((stream) => {
  //       this.video.nativeElement.srcObject = stream;
  //     })
  //     .catch((err) => {
  //       console.error("Error accessing webcam: ", err);
  //     });
  // }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  }
}
