import os
import cv2
import logging
import numpy as np
from person_intersection import yolo_detect, is_intersecting, tracker
from model_parameters import selected_model, process_video
from tensorflow.keras.applications.mobilenet import preprocess_input
from config import YOLO_ENABLED, CONFIDENCE_THRESHOLD, VIDEO_OUTPUT_DIR, FRAME_SIZE, NUM_FRAMES

YOLO_ENABLED = False
model = selected_model(YOLO_ENABLED)
logging.basicConfig(level=logging.INFO)

def predict_and_display(video_path, model):
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_path = VIDEO_OUTPUT_DIR + '/annotated_video.mp4'
    os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True)  # Ensure the output directory exists
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frames = []
    predicted_label = 0
    confidence = 0

    if YOLO_ENABLED:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            results = model.predict(frame, conf=0.6)
            # Annotate frame with detections
            annotated_frame = results[0].plot()

            # for r in results:
            #     for box in r.boxes:
            #         x1, y1, x2, y2 = box.xyxy[0]
            #         cls = int(box.cls[0])
            #         label = "Violence" if cls == 1 else "Non-Violence"
            #         color = (0, 0, 255) if cls == 1 else (0, 255, 0)

            #         cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            #         cv2.putText(annotated_frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

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
video_path = 'test_samples/violent/office_fight.mp4'
result_path = predict_and_display(video_path, model)

play_video(result_path)