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

class ViolenceDetectionProcessor:
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
        self.output_filename = f"violence_detection_{self.current_date}.txt"
        
        if not os.path.exists(self.output_filename):
            with open(self.output_filename, "w", encoding="utf-8") as file:
                file.write("Timestamp | Violence Detected | Weapon Detected | Severity | Location\n")
                file.write("-" * 100 + "\n")

        self.frame_queue = Queue(maxsize=10)
        self.analysis_queue = []
        self.lock = threading.Lock()
        self.stop_event = threading.Event()
        self.latest_response = ""
        self.last_frame_sent_time = 0
        self.frame_counter = 0
        self.buffer = []

    async def analyze_frame_with_openai(self, frame, session):
        """Analyze frame for violence and weapon detection using OpenAI."""
        try:
            frame_small = cv2.resize(frame, (320, 240))
            _, img_buffer = cv2.imencode(".jpg", frame_small, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
            base64_image = base64.b64encode(img_buffer).decode("utf-8")
            
            with open("prompts/violence_detection.txt", "r") as f:
                prompt = f.read()

            api_key="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",
            async with session.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
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
                            frame, timestamp = self.analysis_queue.pop(0)
                        
                        response_content = await self.analyze_frame_with_openai(frame, session)
                        print("Response", response_content)
                        
                        # Parse the response to extract violence and weapon detection
                        violence_detected = "No"
                        weapon_detected = "No"
                        severity = "Low"
                        
                        try:
                            if "<violence_detection>" in response_content:
                                violence_part = response_content.split("<violence_detection>")[1].split("</violence_detection>")[0]
                                if "Violence Detected:" in violence_part:
                                    violence_detected = violence_part.split("Violence Detected:")[1].strip()
                            
                            if "<weapon_detection>" in response_content:
                                weapon_part = response_content.split("<weapon_detection>")[1].split("</weapon_detection>")[0]
                                if "Weapon Detected:" in weapon_part:
                                    weapon_detected = weapon_part.split("Weapon Detected:")[1].strip()
                            
                            if "<severity>" in response_content:
                                severity_part = response_content.split("<severity>")[1].split("</severity>")[0]
                                if "Severity:" in severity_part:
                                    severity = severity_part.split("Severity:")[1].strip()
                        except Exception as e:
                            print(f"Error parsing response: {e}")
                        
                        # Write to file
                        with open(self.output_filename, "a", encoding="utf-8") as file:
                            file.write(f"{timestamp} | {violence_detected} | {weapon_detected} | {severity} | Camera 1\n")
                        
                        self.latest_response = f"Violence: {violence_detected}\nWeapon: {weapon_detected}\nSeverity: {severity}"
                    else:
                        await asyncio.sleep(0.1)

        # Create new event loop for the thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_analysis())

    def process_frame(self, frame):
        """Add frame to analysis queue every 2 seconds."""
        current_time = time.time()
        if current_time - self.last_frame_sent_time >= 1:
            self.last_frame_sent_time = current_time
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            with self.lock:
                if len(self.analysis_queue) < 10:
                    self.analysis_queue.append((frame, timestamp))

    def process_video_frame(self, frame):
        """Process video frame with YOLO and display detection results."""
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

                if class_name == "person" or class_name == "gun":
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
                    self.process_frame(frame)

        return frame

    def post_process_frame(self, frame):
        """Add detection status to the frame."""
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
                cv2.imshow("Violence Detection", processed_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

        self.stop_event.set()
        self.cap.release()
        self.video_writer.release()
        cv2.destroyAllWindows()
        print(f"✅ Processing completed. Output video saved to {self.output_video_file}")
