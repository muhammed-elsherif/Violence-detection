import cv2
import threading
import base64
import requests
import uvicorn
from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from model_parameters import selected_model

app = FastAPI()

CAMERA_URL = 'rtsp://username:password@camera-ip/stream'  # or 0 for USB
ALERT_ENDPOINT = 'http://localhost:4000/alerts/gun'
CAMERA_LOCATION = { 'lat': 30.0444, 'lng': 31.2357 }

fire_detected = False
frame_lock = threading.Lock()
latest_frame = None
model = selected_model(True)

def fire_detection_loop():
    global fire_detected, latest_frame, model
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        with frame_lock:
            latest_frame = frame.copy()

        results = model.predict(frame, conf=0.6)
        for result in results:
            if 0 in result.boxes.cls.tolist():  # 0 is fire class index
                if not fire_detected:
                    fire_detected = True
                    _, jpeg = cv2.imencode('.jpg', frame)
                    b64_image = base64.b64encode(jpeg.tobytes()).decode('utf-8')

                    # Send alert to Nest backend
                    requests.post(ALERT_ENDPOINT, json={
                        'image': f'data:image/jpeg;base64,{b64_image}',
                        'location': CAMERA_LOCATION
                    })
                break
        else:
            fire_detected = False
        # red_pixel_count = cv2.countNonZero(cv2.inRange(frame, (0, 0, 100), (100, 100, 255)))
        # if red_pixel_count > 50000 and not fire_detected:
        #     fire_detected = True
        #     _, jpeg = cv2.imencode('.jpg', frame)
        #     b64_image = base64.b64encode(jpeg.tobytes()).decode('utf-8')

        #     # Send alert
        #     requests.post(ALERT_ENDPOINT, json={
        #         'image': f'data:image/jpeg;base64,{b64_image}',
        #         'location': CAMERA_LOCATION
        #     })

threading.Thread(target=fire_detection_loop, daemon=True).start()

def generate_stream():
    global latest_frame
    while True:
        with frame_lock:
            if latest_frame is None:
                continue
            _, buffer = cv2.imencode('.jpg', latest_frame)
            frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(generate_stream(), media_type='multipart/x-mixed-replace; boundary=frame')
