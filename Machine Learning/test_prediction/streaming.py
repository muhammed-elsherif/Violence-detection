# Real-Time Camera Inference
import cv2
import numpy as np
import streamlit as st
from collections import deque
from datetime import datetime
from model_parameters import selected_model
from object_detection.yolo import yolo_detect
from config import YOLO_ENABLED, OBJECT_DETECTION_ENABLED, GUN_DETECTION_ENABLED, FIRE_DETECTION_ENABLED, SMOKE_DETECTION_ENABLED, FRAME_SIZE, NUM_FRAMES, CONFIDENCE_THRESHOLD

violent_frames = []

# --- Streamlit Setup ---
st.title("Real-Time Violence Detection")
stframe = st.empty()
prediction_placeholder = st.container()

# --- Setup webcam ---
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 112)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 112)
cap.set(cv2.CAP_PROP_FPS, 30)  # Set to 30 FPS
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce input lag

if not cap.isOpened():
    print("Error: Could not open webcam")
    st.error("Error: Could not open webcam")
    exit()

if OBJECT_DETECTION_ENABLED:
    object_model = selected_model(object_detection=True)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break

        processed_frame, _, _ = yolo_detect(frame, CONFIDENCE_THRESHOLD)
        # results = object_model.predict(frame, conf=0.6)
        stframe.image(processed_frame, channels="BGR")

elif GUN_DETECTION_ENABLED:
    gun_model = selected_model(gun_detection=True)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break
        results = gun_model.predict(frame, conf=0.6)
        stframe.image(results[0].plot(), channels="BGR")

elif FIRE_DETECTION_ENABLED:
    fire_model = selected_model(fire_detection=True)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break
        results = fire_model.predict(frame, conf=0.6)
        stframe.image(results[0].plot(), channels="BGR")

elif SMOKE_DETECTION_ENABLED:
    smoke_model = selected_model(smoke_detection=True)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break

        results = smoke_model.predict(frame, conf=0.6)
        smoke_class = results[0].names[0]

        # if smoke is detected, draw a red rectangle around the frame
        if smoke_class in results[0].names:
            stframe.image(results[0].plot(), channels="BGR")
        else:
            stframe.image(frame, channels="BGR")

elif YOLO_ENABLED:
    yolo_model = selected_model(violence_detection=True)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            st.error("Error: Failed to capture frame")
            break
        results = yolo_model.predict(frame, conf=0.6)
        stframe.image(results[0].plot(), channels="BGR")

else:
    ctr = 0
    violence_model = selected_model()

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
            prediction = violence_model.predict(input_frames)
            predicted_label = np.argmax(prediction)

            prediction_smoother.append(prediction[0])

            # Average the last few predictions for stability
            avg_pred = np.mean(prediction_smoother, axis=0)
            pred_class = np.argmax(avg_pred)
            confidence = avg_pred[pred_class]

            # Draw prediction on the frame
            if predicted_label == 1 and confidence > CONFIDENCE_THRESHOLD:  # Assuming 1 = Violence
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cv2.rectangle(frame, (50, 50), (frame.shape[1] - 50, frame.shape[0] - 50), (0, 0, 255), 4)
                cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                frame_rgb_copy = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
                violent_frames.append((frame_rgb_copy, timestamp))
                ctr = ctr + 1
                out.write(frame)
            else:
                cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

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
