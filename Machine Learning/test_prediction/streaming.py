# Real-Time Camera Inference
import streamlit as st
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from ultralytics import YOLO
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

st.title("Real-Time Violence Detection")

# Load the trained model
# model_path = "../loaded_models/mobileNet_violence_detection_model.h5"
# model_path = "../loaded_models/mobileNetV2_violence_detection_model.h5"
# model_path = "../loaded_models/mobileNetV2_violence_detection_model_new.h5"
# model_path = "../loaded_models/model_3d_violence_detection_model.h5"
# model_path = "../loaded_models/inceptionV3_violence_detection_model.h5"
# model = load_model(model_path)
# in case of using YOLO
# model_path = "../loaded_models/yolo_best.pt"
# model_path = "../loaded_models/violence_weights.pt" # best
# model_path = "../loaded_models/violence_weights.pt" # best
model = YOLO(model_path)

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
        print("Failed to grab frame")
        st.error("Error: Failed to capture frame")
        break
    
    # Run YOLO model on the frame
    results = model(frame)
    # Annotate frame with detections
    annotated_frame = results[0].plot()

    # Show the frame with predictions
    stframe.image(annotated_frame, channels="BGR")
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            cls = int(box.cls[0])
            label = "Violence" if cls == 1 else "Non-Violence"
            color = (0, 0, 255) if cls == 1 else (0, 255, 0)

            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            cv2.putText(frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # if frame is None:
    #     print("Error: Captured frame is None")
    #     continue  # Skip this iteration

    # resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0
    # # resized_frame = preprocess_input(frame)
    # frames.append(resized_frame)
    
    # # Predict when we have enough frames
    # if len(frames) == NUM_FRAMES:
    #     input_frames = np.expand_dims(np.array(frames), axis=0)
    #     prediction = model.predict(input_frames)
    #     predicted_label = np.argmax(prediction)
    #     # label = "Violence" if np.argmax(prediction) == 1 else "Non-Violence"
    #     confidence = prediction[0][predicted_label]

    #     # Draw prediction on the frame
    #     if predicted_label == 1 and confidence > 0.6:  # Assuming 1 = Violence
    #         cv2.rectangle(frame, (50, 50), (frame.shape[1] - 50, frame.shape[0] - 50), (0, 0, 255), 4)
    #         cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70),
    #                     cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    #     else:
    #         cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70),
    #                     cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    #     frames = []

    # Convert BGR to RGB for Streamlit
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Streamlit displays image instead of cv2.imshow()
    stframe.image(frame_rgb, channels="RGB")

    # cv2.imshow("Violence Detection", frame)

    # Break on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
st.stop()