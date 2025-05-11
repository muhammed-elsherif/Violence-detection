# Real-Time Camera Inference
import time
import cv2
import logging
import numpy as np
import streamlit as st
from collections import deque
from datetime import datetime
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from model_parameters import selected_model, process_video
from object_detection.yolo import yolo_detect
from config import YOLO_ENABLED, OBJECT_DETECTION_ENABLED, GUN_DETECTION_ENABLED, FIRE_DETECTION_ENABLED, FRAME_SIZE, NUM_FRAMES, CONFIDENCE_THRESHOLD

model = selected_model()
violent_frames = []

# --- Streamlit Setup ---
st.title("Real-Time Violence Detection")
stframe = st.empty()
prediction_placeholder = st.container()

# --- Setup webcam ---
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 112)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 112)
# cap.set(cv2.CAP_PROP_FPS, 30)
# cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce input lag

if not cap.isOpened():
    print("Error: Could not open webcam")
    st.error("Error: Could not open webcam")
    exit()

if OBJECT_DETECTION_ENABLED:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break

        processed_frame, _, _ = yolo_detect(frame, CONFIDENCE_THRESHOLD)
        # Show the frame with predictions
        stframe.image(processed_frame, channels="BGR")

elif GUN_DETECTION_ENABLED:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break
        # Run YOLO model on the frame
        results = model.predict(frame, conf=0.6)
        # Annotate frame with detections
        annotated_frame = results[0].plot()

        # Show the frame with predictions
        stframe.image(annotated_frame, channels="BGR")

elif FIRE_DETECTION_ENABLED:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break
        # Run YOLO model on the frame
        results = model.predict(frame, conf=0.6)
        # Annotate frame with detections
        annotated_frame = results[0].plot()

        # Show the frame with predictions
        stframe.image(annotated_frame, channels="BGR")

elif YOLO_ENABLED:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break
        # Run YOLO model on the frame
        results = model.predict(frame, conf=0.6)
        # Annotate frame with detections
        annotated_frame = results[0].plot()

        # Show the frame with predictions
        stframe.image(annotated_frame, channels="BGR")

else:
    ctr = 0

    output_path = "violence_detection_output.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec
    fps = cap.get(cv2.CAP_PROP_FPS) or 30  # Fallback to 30 if FPS not found
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

    frame_queue = deque(maxlen=NUM_FRAMES)
    prediction_smoother = deque(maxlen=5)

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break

        resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0 # Normalize 0-1
        # resized_frame = preprocess_input(frame)
        frame_queue.append(resized_frame)

        if len(frame_queue) == NUM_FRAMES:
            input_frames = np.expand_dims(np.array(frame_queue), axis=0)
            prediction = model.predict(input_frames)
            predicted_label = np.argmax(prediction)
            # label = "Violence" if np.argmax(prediction) == 1 else "Non-Violence"
            # confidence = prediction[0][predicted_label]

            prediction_smoother.append(prediction[0])

            # Average the last few predictions for stability
            avg_pred = np.mean(prediction_smoother, axis=0)
            pred_class = np.argmax(avg_pred)
            confidence = avg_pred[pred_class]

            # Draw prediction on the frame
            if predicted_label == 1 and confidence > CONFIDENCE_THRESHOLD:  # Assuming 1 = Violence
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cv2.rectangle(frame, (50, 50), (frame.shape[1] - 50, frame.shape[0] - 50), (0, 0, 255), 4)
                cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                frame_rgb_copy = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
                violent_frames.append((frame_rgb_copy, timestamp))
                ctr = ctr + 1
                out.write(frame)
            else:
                cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        # Convert BGR to RGB for Streamlit
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Streamlit displays image instead of cv2.imshow()
        stframe.image(frame_rgb, channels="RGB")

        if ctr > 10:
            break

    out.release()

# Display violent frames with timestamp
st.subheader("Detected Violent Frames:")
for v_frame, v_time in violent_frames:
    st.image(v_frame, channels="RGB", caption=f"Detected at: {v_time}")

cap.release()
cv2.destroyAllWindows()
st.stop()