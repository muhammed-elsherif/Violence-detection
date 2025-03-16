# from google.colab.patches import cv2_imshow
import cv2
import numpy as np  # Import NumPy for numerical operations
from ultralytics import YOLO  # Import YOLO from Ultralytics for object detection
import base64  # Import base64 for encoding images to send to OpenAI
import os  # Import os for file operations (e.g., checking if file exists)
import time  # Import time for timing operations (e.g., frame intervals)
import threading  # Import threading for running tasks in parallel (e.g., frame reading)
from queue import Queue  # Import Queue for thread-safe frame buffering
import asyncio  # Import asyncio for asynchronous OpenAI API calls
import aiohttp  # Import aiohttp for making async HTTP requests to OpenAI
import cvzone  # Import cvzone for enhanced text rendering on frames

# Initialize OpenAI client (for compatibility, but we'll use aiohttp for async calls)
from openai import OpenAI  # Import OpenAI library for API client initialization
client = OpenAI(  # Create an OpenAI client instance
    base_url="https://openrouter.ai/api/v1",  # Set the base URL to OpenRouter's API endpoint
    api_key="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",  # Set your OpenRouter API key (replace with your actual key)
)

class CarAccidentDetectionProcessor:  # Define the class for accident detection processing
    def __init__(self, video_file, yolo_model_path="yolo_weights/yolo12s.pt", output_video_file="output_video.mp4"):  # Constructor with video file and model paths
        """Initialize car accident detection processor."""
        try:  # Start a try block to handle potential errors
            self.yolo_model = YOLO(yolo_model_path)  # Load the YOLO model from the specified path
            self.names = self.yolo_model.names  # Get class names (e.g., "car", "accident") from the model
        except Exception as e:  # Catch any errors during model loading
            raise RuntimeError(f"Error loading YOLO model: {e}")  # Raise an error with details if loading fails

        self.cap = cv2.VideoCapture(video_file)  # Open the input video file
        if not self.cap.isOpened():  # Check if the video file opened successfully
            raise FileNotFoundError("Error: Could not open video file.")  # Raise an error if video can't be opened

        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))  # Get the video's frame width
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))  # Get the video's frame height
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))  # Get the video's frames per second (FPS)

        self.output_video_file = output_video_file  # Store the output video file path
        self.video_writer = cv2.VideoWriter(  # Initialize the video writer to save processed video
            self.output_video_file,  # Output file path
            cv2.VideoWriter_fourcc(*'mp4v'),  # Use MP4V codec for .mp4 files
            self.fps,  # Set the FPS for the output video
            (self.frame_width, self.frame_height)  # Set the frame size for the output video
        )

        self.current_date = time.strftime("%Y-%m-%d_%H-%M-%S")  # Get current date and time for unique folder name
        self.images_folder = os.path.join("sent_images", f"images_{self.current_date}")  # Define folder path
        if not os.path.exists(self.images_folder):  # Check if folder doesn't exist
            os.makedirs(self.images_folder)  # Create the folder
        self.image_counter = 0  # Counter for unique image filenames

        self.output_filename = f"accident_data_{self.current_date}.txt"  # Define the output text file name
        self.frame_counter = 0  # Initialize a counter for frames processed
        self.last_frame_sent_time = 0  # Track the last time a frame was sent to OpenAI
        self.frame_queue = Queue(maxsize=10)  # Create a queue for video frame reading (max 10 frames)
        self.analysis_queue = []  # List to queue frames for OpenAI analysis
        self.lock = threading.Lock()  # Create a lock for thread-safe queue access
        self.stop_event = threading.Event()  # Event to signal threads to stop
        self.buffer = []  # Buffer to store text data before writing to file
        self.latest_response = ""  # Store the latest OpenAI response for display

        if not os.path.exists(self.output_filename):  # Check if the output text file doesn't exist
            with open(self.output_filename, "w", encoding="utf-8") as file:  # Create and open the file for writing
                file.write("Timestamp | Track ID | Accident Severity | Vehicles Involved | Location Details | Reason\n")  # Write header
                file.write("-" * 100 + "\n")  # Write a separator line

    async def analyze_frame_with_openai(self, frame, track_id, session):  # Async method to analyze frames with OpenAI
        """Analyze frame asynchronously using OpenAI via OpenRouter.ai with an improved prompt."""
        try:  # Start a try block to handle API call errors
            frame_small = cv2.resize(frame, (320, 240))  # Resize frame to 320x240 for faster processing
            _, img_buffer = cv2.imencode(".jpg", frame_small, [int(cv2.IMWRITE_JPEG_QUALITY), 70])  # Encode frame to JPG with 70% quality
            base64_image = base64.b64encode(img_buffer).decode("utf-8")  # Convert encoded image to base64 string

            prompt = """
                Analyze the image, a frame from a road surveillance video, to detect and assess any car accident. Focus on clear visual indicators such as:

                - **Vehicle Damage**: Dents, broken parts, open hoods, or misalignment.
                - **Unusual Vehicle Positions**: Off-road, collisions, or abnormal angles.
                - **Debris & Skid Marks**: Road obstacles, scattered parts, or visible tire marks.
                - **Traffic Disruption**: Stalled vehicles, congestion, or people gathering.
                - **Weather Impact**: Wet roads or low visibility affecting conditions.

                ### Output Format:
                Provide a structured table summarizing the findings strictly based on visible evidence:

                | Accident Severity (Details) | Vehicles Involved | Location Type | Likely Cause               |
                |------------------|-------------------|--------------|----------------------------|
                | Medium / High | Number of affected vehicles | (e.g., intersection, village road) | (e.g., collision, skidding, unclear) |

                ### Severity Levels:
                - **Medium**: Minor damage, clustering of people/cars, open car hood , Unusual Vehicle Positions, Unusual people Positions , collisions.
                - **High**: Severe damage, emergency response, road blockage.

                Stick to observed evidence and avoid speculation.
                """
 # Define the detailed prompt for OpenAI to detect accidents accurately
            api_key = "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"  # API key (replace with your actual key)
            async with session.post(  # Make an async POST request to OpenRouter API
                "https://openrouter.ai/api/v1/chat/completions",  # API endpoint
                headers={"Authorization": f"Bearer {api_key}"},  # Authorization header with API key
                json={  # JSON payload for the request
                    "model": "google/gemini-2.0-pro-exp-02-05:free",  # Specify the model to use
                    "messages": [  # List of messages for the chat completion
                        {
                            "role": "user",  # User role for the message
                            "content": [  # Content array with text and image
                                {"type": "text", "text": prompt},  # Text prompt
                                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}  # Image data
                            ]
                        }
                    ]
                }
            ) as response:  # Store the response
                result = await response.json()  # Parse the response as JSON
                if "choices" in result and result["choices"]:  # Check if response has valid choices
                    response_text = result["choices"][0]["message"]["content"].strip()  # Extract the response text
                    print("Response", response_text)  # Print the response for debugging
                    return response_text  # Return the response
                print("❌ Invalid response from OpenAI API.")  # Log invalid response
                return "Error: Invalid response from OpenAI API."  # Return error message
        except Exception as e:  # Catch any errors during API call
            print(f"❌ Error invoking OpenAI model: {e}")  # Log the error
            return "Error processing image."  # Return error message

    def process_frame_in_thread(self):  # Method to process frames in a separate thread
        """Process frames from the analysis queue asynchronously."""
        async def run_analysis():  # Define async function for analysis
            async with aiohttp.ClientSession() as session:  # Create an async HTTP session
                while not self.stop_event.is_set():  # Loop until stop event is triggered
                    if self.analysis_queue:  # Check if there are frames to analyze
                        with self.lock:  # Lock the queue for thread-safe access
                            frame, timestamp, track_id = self.analysis_queue.pop(0)  # Get the next frame from queue
                        response_content = await self.analyze_frame_with_openai(frame, track_id, session)  # Analyze frame
                        extracted_data = response_content.split("\n")[2:]  # Extract data rows, skipping header
                        if extracted_data:  # Check if there’s data to process
                            for row in extracted_data:  # Loop through each data row
                                if "--------------" in row or not row.strip():  # Skip separator or empty lines
                                    continue
                                values = [col.strip() for col in row.split("|")[1:-1]]  # Parse row into values
                                if len(values) == 4:  # Ensure 4 columns (severity, vehicles, location, reason)
                                    severity, vehicles, location, reason = values  # Unpack values
                                    self.buffer.append(f"{timestamp} | {track_id} | {severity} | {vehicles} | {location} | {reason}\n")  # Add to buffer
                                    self.latest_response = f"Severity: {severity}\nVehicles: {vehicles}\nLocation: {location}\nReason: {reason}"  # Update latest response
                                    print(f"✅ Accident detected: Track ID={track_id}, Severity={severity}, Reason={reason}")  # Log detection
                            if len(self.buffer) >= 5:  # Check if buffer has 5 or more entries
                                with open(self.output_filename, "a", encoding="utf-8") as file:  # Open file in append mode
                                    file.writelines(self.buffer)  # Write buffer to file
                                self.buffer = []  # Clear buffer after writing
                    else:  # If no frames in queue
                        await asyncio.sleep(0.1)  # Sleep briefly to avoid busy-waiting

        asyncio.run(run_analysis())  # Run the async analysis function

    def process_frame(self, frame, track_id):  # Method to queue frames for analysis
        """Add frame to analysis queue every 2 seconds and save it."""
        current_time = time.time()  # Get current time
        if current_time - self.last_frame_sent_time >= 1:  # Check if 2 seconds have passed since last send
            self.last_frame_sent_time = current_time  # Update last sent time
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")  # Get current timestamp
            with self.lock:  # Lock the queue for thread-safe access
                if len(self.analysis_queue) < 10:  # Check if queue has space (max 10)
                    # Save the frame to the images folder
                    self.image_counter += 1
                    image_filename = os.path.join(self.images_folder, f"frame_{self.image_counter:04d}.jpg")
                    cv2.imwrite(image_filename, frame)  # Save the original frame
                    self.analysis_queue.append((frame, timestamp, track_id))  # Add frame to analysis queue

    def process_video_frame(self, frame):  # Method to process frames with YOLO
        """Process video frame with YOLO and display class and ID in top-left with style."""
        frame_resized = cv2.resize(frame, (640, 480))  # Resize frame for faster YOLO inference
        results = self.yolo_model.track(frame_resized, persist=True)  # Run YOLO tracking on resized frame

        if results and results[0].boxes is not None:  # Check if detection results exist
            boxes = results[0].boxes.xyxy.int().cpu().tolist()  # Get bounding box coordinates
            class_ids = results[0].boxes.cls.int().cpu().tolist()  # Get class IDs
            track_ids = results[0].boxes.id.int().cpu().tolist() if results[0].boxes.id is not None else [-1] * len(boxes)  # Get track IDs or default to -1

            scale_x, scale_y = self.frame_width / 640, self.frame_height / 480  # Calculate scaling factors for original resolution
            for box, class_id, track_id in zip(boxes, class_ids, track_ids):  # Loop through detections
                x1, y1, x2, y2 = map(int, [box[0] * scale_x, box[1] * scale_y, box[2] * scale_x, box[3] * scale_y])  # Scale coordinates to original frame
                class_name = self.names[class_id]  # Get class name from ID

                if class_name == "car" or class_name == "accident":  # Check if detected object is a car or accident
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)  # Draw red bounding box
                    label = f"{class_name} ID: {track_id}"  # Create label with class and ID
                    cvzone.putTextRect(  # Add styled text above bounding box
                        frame,
                        label,
                        (x1, y1 - 10),  # Position at top-left, slightly above box
                        scale=1,  # Medium font size
                        thickness=2,  # Text thickness
                        colorT=(0, 0, 0),  # Black text
                        colorR=(173, 216, 230),  # Light blue background
                        offset=5  # Padding around text
                    )
                    self.process_frame(frame, track_id)  # Queue frame for OpenAI analysis

        return frame  # Return processed frame

    def post_process_frame(self, frame):  # Method to add alerts and OpenAI response
        """Add alerts and OpenAI response to the frame."""
        with open(self.output_filename, "r", encoding="utf-8") as file:  # Open the text file for reading
            lines = file.readlines()  # Read all lines from file

        for line in lines[2:]:  # Loop through lines, skipping header and separator
            if "|" in line and "Accident Severity (Details)" not in line:  # Filter out header-like rows
                parts = [part.strip() for part in line.split("|")]  # Split and strip line into parts
                if len(parts) >= 3:  # Ensure enough columns exist
                    severity = parts[2].lower()  # Get severity column and convert to lowercase
                    if "medium" in severity or "high" in severity:  # Check for medium or high severity
                        cv2.putText(frame, "ALERT: Accident Detected!", (10, 50),  # Add alert text
                                  cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)  # Bold red text
                        break  # Exit loop after adding alert

        if self.latest_response:  # Check if there’s a response to display
            y_pos = self.frame_height - 120  # Start position 120 pixels from bottom
            for line in self.latest_response.split("\n"):  # Loop through response lines
                cvzone.putTextRect(  # Add each line with styled rectangle
                    frame,
                    line,
                    (10, y_pos),  # Position at current y-coordinate
                    scale=0.8,  # Smaller font size
                    thickness=1,  # Text thickness
                    colorT=(255, 255, 255),  # White text
                    colorR=(50, 50, 50),  # Dark gray background
                    offset=5  # Padding around text
                )
                y_pos += 30  # Move up 30 pixels for next line

        return frame  # Return processed frame

    def read_frames(self):  # Method to read frames in a separate thread
        """Read frames in a separate thread."""
        while self.cap.isOpened():  # Loop while video is open
            ret, frame = self.cap.read()  # Read next frame
            if not ret:  # Check if frame reading failed (end of video)
                break  # Exit loop if no more frames
            self.frame_queue.put(frame)  # Add frame to queue
        self.frame_queue.put(None)  # Add None to signal end of video

    def start_processing(self):  # Main method to start video processing
        """Start video processing with optimizations."""
        threading.Thread(target=self.read_frames, daemon=True).start()  # Start frame reading thread
        threading.Thread(target=self.process_frame_in_thread, daemon=True).start()  # Start analysis thread

        while True:  # Main processing loop
            frame = self.frame_queue.get()  # Get next frame from queue
            if frame is None:  # Check if end of video (None received)
                break  # Exit loop if no more frames
            self.frame_counter += 1  # Increment frame counter
            if self.frame_counter % 3 == 0:  # Process every 3rd frame for efficiency
                processed_frame = self.process_video_frame(frame)  # Process frame with YOLO
                processed_frame = self.post_process_frame(processed_frame)  # Add alerts and response
                self.video_writer.write(processed_frame)  # Write frame to output video
                cv2.imshow("Car Accident Detection", processed_frame)  # Display processed frame
                if cv2.waitKey(1) & 0xFF == ord("q"):  # Check for 'q' key to quit
                    break  # Exit loop if 'q' pressed

        self.stop_event.set()  # Signal threads to stop
        self.cap.release()  # Release video capture resource
        self.video_writer.release()  # Release video writer resource
        cv2.destroyAllWindows()  # Close all OpenCV windows
        if self.buffer:  # Check if buffer has remaining data
            with open(self.output_filename, "a", encoding="utf-8") as file:  # Open file in append mode
                file.writelines(self.buffer)  # Write remaining buffer to file
        print(f"✅ Processing completed. Output video saved to {self.output_video_file}")  # Log completion

if __name__ == "__main__":  # Entry point for script execution
    video_file = "./test_samples/crash/3.mp4"  # Specify input video file (replace with your file)
    output_video_file = "output_video.mp4"  # Specify output video file name
    processor = CarAccidentDetectionProcessor(video_file, output_video_file=output_video_file)  # Create processor instance
    processor.start_processing()  # Start the processing
    os.system(f"open {output_video_file}")
