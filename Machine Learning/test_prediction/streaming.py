# Real-Time Camera Inference
import streamlit as st
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from ultralytics import YOLO  

st.title("Real-Time Violence Detection")

# Load the trained model
model_path = "../loaded_models/mobileNet_violence_detection_model.h5"
# model_path = "../loaded_models/inceptionV3_violence_detection_model.h5"
model = load_model(model_path)
# model_path = "../violence_weights.pt" # in case of using YOLO
# model = YOLO(model_path)

FRAME_SIZE = (112, 112)
NUM_FRAMES = 1
frames = []

# Initialize webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 30)

if not cap.isOpened():
    print("Error: Could not open webcam")
    st.error("Error: Could not open webcam")
    exit()

stframe = st.empty()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        st.error("Error: Failed to capture frame")
        break

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        # st.error("Error: Failed to capture frame")
        break

    # Run YOLO model on the frame
    # results = model(frame)

    # # Annotate frame with detections
    # annotated_frame = results[0].plot()

    # # Show the frame with predictions
    # stframe.image(annotated_frame, channels="BGR")

    resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0
    frames.append(resized_frame)

    # Predict when we have enough frames
    if len(frames) == NUM_FRAMES:
        input_frames = np.expand_dims(np.array(frames), axis=0)
        prediction = model.predict(input_frames)
        predicted_label = np.argmax(prediction)
        # label = "Violence" if np.argmax(prediction) == 1 else "Non-Violence"
        confidence = prediction[0][predicted_label]

        # Draw prediction on the frame
        if predicted_label == 1 and confidence > 0.6:  # Assuming 1 = Violence
            cv2.rectangle(frame, (50, 50), (frame.shape[1] - 50, frame.shape[0] - 50), (0, 0, 255), 4)
            cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        else:
            cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        frames = []  # Reset frame buffer

        # Show the frame with predictions
        cv2.imshow("Violence Detection", frame)

        # Break on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        # stframe.image(frame, channels="BGR")

cap.release()
cv2.destroyAllWindows()