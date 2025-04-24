import os
import uuid
import cv2
import logging
import numpy as np
from model_parameters import selected_model, process_video
from object_detection.yolo import yolo_detect
from crash_detection import CarAccidentDetectionProcessor
from tensorflow.keras.applications.mobilenet import preprocess_input
from config import YOLO_ENABLED, OBJECT_DETECTION_ENABLED, GUN_DETECTION_ENABLED, CRASH_DETECTION_ENABLED, CONFIDENCE_THRESHOLD, VIDEO_OUTPUT_DIR, FRAME_SIZE, NUM_FRAMES

model = selected_model()
logging.basicConfig(level=logging.INFO)

def predict_and_display(video_path, model, output_path):
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frames = []
    predicted_label = 0
    confidence = 0

    while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            if OBJECT_DETECTION_ENABLED:
                processed_frame, _, _ = yolo_detect(frame, CONFIDENCE_THRESHOLD)

                out.write(processed_frame)

            elif GUN_DETECTION_ENABLED:
                results = model.predict(frame, conf=0.6)
                annotated_frame = results[0].plot()

                out.write(annotated_frame)

            elif YOLO_ENABLED:
                results = model.predict(frame, conf=0.6)
                annotated_frame = results[0].plot()

                out.write(annotated_frame)

            else:
                ### predict by video
                frames = process_video(video_path) # shape: (FRAMES, H, W, 3)
                input_frames = np.expand_dims(frames, axis=0) # shape: (1, FRAMES, H, W, 3)
                prediction = model.predict(input_frames) # shape: (NUM_CLASSES,)
                predicted_label = np.argmax(prediction)
                confidence = prediction[0][predicted_label]
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                while cap.isOpened():
                    success, frame = cap.read()
                    if not success:
                        break

                    ### predict frame by frame
                    # resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0
                    # # resized_frame = cv2.resize(frame, FRAME_SIZE)
                    # # resized_frame = preprocess_input(resized_frame)  # Normalize for MobileNet
                    # frames.append(resized_frame)

                    # if len(frames) == NUM_FRAMES:
                    #     input_frames = np.expand_dims(frames, axis=0) # shape: (1, FRAMES, H, W, 3)
                    #     prediction = model.predict(input_frames) # shape: (NUM_CLASSES,)
                    #     predicted_label = np.argmax(prediction)
                    #     confidence = prediction[0][predicted_label]

                    if predicted_label == 1:  # Assuming 1 = Violence
                        cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 0, 255), 4)
                        cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    else:
                        cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                    out.write(frame)
                    frames = []

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    logging.info("Processed video saved at %s", output_path)
    return output_path

def play_video(filepath):
    if os.path.exists(filepath):
        # os.system(f"start {filepath}")  # Windows
        os.system(f"open {filepath}")   # macOS
        # os.system(f"xdg-open {filepath}")  # Linux
    else:
        print("Error: File not found!", filepath)

# ---------------------- Test samples ----------------------
# ----- Normal Situations -----
# video_path = 'test_samples/normal/1.mp4'
video_path = 'test_samples/normal/2.mp4'
video_path = 'test_samples/normal/3.mp4'
# video_path = 'test_samples/normal/4.mp4'
video_path = 'test_samples/normal/people.mp4'
# video_path = 'test_samples/normal/people2.mp4'

# ----- Violent Situations -----
# video_path = 'test_samples/violent/V_19.mp4'
# video_path = 'test_samples/violent/0.mp4'
# video_path = 'test_samples/violent/test_home.MOV'
video_path = 'test_samples/violent/gun_test.jpg'
# video_path = 'test_samples/violent/office_fight.mp4'

os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True)  # Ensure the output directory exists

if CRASH_DETECTION_ENABLED:
    video_file = "test_samples/crash/2.mp4"
    result_path = os.path.join(VIDEO_OUTPUT_DIR, f"annotated_crash_{uuid.uuid4().hex}.mp4")
    processor = CarAccidentDetectionProcessor(video_file, output_video_file=result_path)
    processor.start_processing()

else:
    output_path = VIDEO_OUTPUT_DIR + f"annotated_vil_{uuid.uuid4().hex}.mp4"
    result_path = predict_and_display(video_path, model, output_path)

play_video(result_path)