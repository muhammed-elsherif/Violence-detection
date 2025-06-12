import cv2
from ultralytics import YOLO
import base64
import os
import time
import threading
from queue import Queue
import asyncio
import aiohttp
import cvzone

from openai import OpenAI
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)

class CarAccidentDetectionProcessor:
    def __init__(self, video_file, yolo_model_path="yolo_weights/yolo12s.pt", output_video_file="output_video.mp4"):
        try:
            self.yolo_model = YOLO(yolo_model_path)
            self.names = self.yolo_model.names
        except Exception as e:
            raise RuntimeError(f"Error loading YOLO model: {e}")

        self.cap = cv2.VideoCapture(video_file)
        if not self.cap.isOpened():
            raise FileNotFoundError("Error: Could not open video file.")

        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))

        self.output_video_file = output_video_file
        self.video_writer = cv2.VideoWriter(
            self.output_video_file,
            cv2.VideoWriter_fourcc(*'mp4v'),
            self.fps,
            (self.frame_width, self.frame_height)
        )

        self.current_date = time.strftime("%Y-%m-%d_%H-%M-%S")
        self.images_folder = os.path.join("sent_images", f"images_{self.current_date}")
        self.output_filename = f"accident_data_{self.current_date}.txt"

        if not os.path.exists(self.images_folder):
            os.makedirs(self.images_folder)
        
        self.image_counter = 0

        self.frame_counter = 0
        self.last_frame_sent_time = 0
        self.frame_queue = Queue(maxsize=10)
        self.analysis_queue = []
        self.lock = threading.Lock()
        self.stop_event = threading.Event()
        self.buffer = []
        self.latest_response = ""

        if not os.path.exists(self.output_filename):
            with open(self.output_filename, "w", encoding="utf-8") as file:
                file.write("Timestamp | Track ID | Accident Severity | Vehicles Involved | Location Details | Reason\n")
                file.write("-" * 100 + "\n")

    async def analyze_frame_with_openai(self, frame, track_id, session):
        try:
            frame_small = cv2.resize(frame, (320, 240))
            _, img_buffer = cv2.imencode(".jpg", frame_small, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
            base64_image = base64.b64encode(img_buffer).decode("utf-8")
            with open("prompts/crash_detection.txt", "r") as f:
                prompt = f.read()

            async with session.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {client.api_key}"},
                json={
                    "model": "google/gemini-2.0-flash-exp:free",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                            ]
                        }
                    ]
                }
            ) as response:
                result = await response.json()
                if "choices" in result and result["choices"]:
                    response_text = result["choices"][0]["message"]["content"].strip()
                    print("Response", response_text)
                    return response_text
                return "Error: Invalid response from OpenAI API."
        except Exception as e:
            return "Error processing image."

    def process_frame_in_thread(self):
        """Process frames from the analysis queue asynchronously."""
        async def run_analysis():
            async with aiohttp.ClientSession() as session:
                while not self.stop_event.is_set():
                    if self.analysis_queue:
                        with self.lock:
                            frame, timestamp, track_id = self.analysis_queue.pop(0)

                        response_content = await self.analyze_frame_with_openai(frame, track_id, session)
                        extracted_data = response_content.split("\n")
                        if extracted_data:
                            for row in extracted_data:
                                if "--------------" in row or not row.strip():
                                    continue
                                values = [col.strip() for col in row.split("|")[1:-1]]
                                if len(values) == 4:
                                    severity, vehicles, location, reason = values
                                    self.buffer.append(f"{timestamp} | {track_id} | {severity} | {vehicles} | {location} | {reason}\n")
                                    self.latest_response = f"Severity: {severity}\nVehicles: {vehicles}\nLocation: {location}\nReason: {reason}"
                                    print(f"✅ Accident detected: Track ID={track_id}, Severity={severity}, Reason={reason}")
                            if len(self.buffer) >= 5:
                                with open(self.output_filename, "a", encoding="utf-8") as file:
                                    file.writelines(self.buffer)
                                self.buffer = []
                    else:
                        await asyncio.sleep(0.1)

        asyncio.run(run_analysis())

    def process_frame(self, frame, track_id):
        """Add frame to analysis queue every 1 second and save it."""
        current_time = time.time()
        if current_time - self.last_frame_sent_time >= 1:
            self.last_frame_sent_time = current_time
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            with self.lock:
                if len(self.analysis_queue) < 10:
                    self.image_counter += 1
                    image_filename = os.path.join(self.images_folder, f"frame_{self.image_counter:04d}.jpg")
                    cv2.imwrite(image_filename, frame)
                    self.analysis_queue.append((frame, timestamp, track_id))

    def process_video_frame(self, frame):
        """Process video frame with YOLO and display class and ID in top-left with style."""
        frame_resized = cv2.resize(frame, (640, 480))
        results = self.yolo_model.track(frame_resized, persist=True)

        if results and results[0].boxes is not None:
            boxes = results[0].boxes.xyxy.int().cpu().tolist()
            class_ids = results[0].boxes.cls.int().cpu().tolist()
            track_ids = results[0].boxes.id.int().cpu().tolist() if results[0].boxes.id is not None else [-1] * len(boxes)

            scale_x, scale_y = self.frame_width / 640, self.frame_height / 480
            for box, class_id, track_id in zip(boxes, class_ids, track_ids):
                x1, y1, x2, y2 = map(int, [box[0] * scale_x, box[1] * scale_y, box[2] * scale_x, box[3] * scale_y])
                class_name = self.names[class_id]

                if class_name == "car" or class_name == "accident":
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    label = f"{class_name} ID: {track_id}"
                    cvzone.putTextRect(
                        frame,
                        label,
                        (x1, y1 - 10),
                        scale=1,
                        thickness=2,
                        colorT=(0, 0, 0),
                        colorR=(173, 216, 230),
                        offset=5
                    )
                    self.process_frame(frame, track_id)

        return frame

    def post_process_frame(self, frame):
        """Add alerts and OpenAI response to the frame."""
        with open(self.output_filename, "r", encoding="utf-8") as file:
            lines = file.readlines()

        for line in lines[2:]:
            if "|" in line and "Accident Severity (Details)" not in line:
                parts = [part.strip() for part in line.split("|")]
                if len(parts) >= 3:
                    severity = parts[2].lower()
                    if "medium" in severity or "high" in severity:
                        cv2.putText(frame, "ALERT: Accident Detected!", (10, 50),
                                  cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
                        break

        if self.latest_response:
            y_pos = self.frame_height - 120
            for line in self.latest_response.split("\n"):
                cvzone.putTextRect(
                    frame,
                    line,
                    (10, y_pos),
                    scale=0.8,
                    thickness=1,
                    colorT=(255, 255, 255),
                    colorR=(50, 50, 50),
                    offset=5
                )
                y_pos += 30

        return frame

    def read_frames(self):
        """Read frames in a separate thread."""
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break
            self.frame_queue.put(frame)
        self.frame_queue.put(None)

    def start_processing(self):
        """Start video processing with optimizations."""
        threading.Thread(target=self.read_frames, daemon=True).start()
        threading.Thread(target=self.process_frame_in_thread, daemon=True).start()

        while True:
            frame = self.frame_queue.get()
            if frame is None:
                break

            self.frame_counter += 1
            if self.frame_counter % 3 == 0:
                processed_frame = self.process_video_frame(frame)
                processed_frame = self.post_process_frame(processed_frame)
                self.video_writer.write(processed_frame)
                cv2.imshow("Car Accident Detection", processed_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

        self.stop_event.set()
        self.cap.release()
        self.video_writer.release()
        cv2.destroyAllWindows()
        if self.buffer:
            with open(self.output_filename, "a", encoding="utf-8") as file:
                file.writelines(self.buffer)
        print(f"✅ Processing completed. Output video saved to {self.output_video_file}")
