# Real-Time Camera Inference
import streamlit as st
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from person_intersection import yolo_detect, is_intersecting
from model_parameters import selected_model

yolo = False
model, frame_size, frames_count = selected_model(yolo)

st.title("Real-Time Violence Detection")

# Initialize webcam
stframe = st.empty()
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 224)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 224)
cap.set(cv2.CAP_PROP_FPS, 30)

if not cap.isOpened():
    print("Error: Could not open webcam")
    st.error("Error: Could not open webcam")
    exit()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        st.error("Error: Failed to capture frame")
        break

    frames = []
    if frame is None:
        print("Error: Captured frame is None")
        continue  # Skip this iteration

    if yolo:
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
    
    else:
        # Run YOLO to detect persons and track them
        processed_frame, tracked_objects = yolo_detect(frame.copy(), 0.5)

        # Check for intersections between every pair of tracked persons
        intersected_pairs = set()
        obj_list = list(tracked_objects.items())
        for i in range(len(obj_list)):
            for j in range(i + 1, len(obj_list)):
                # bbox is the second element in the tuple (centroid, bbox)
                _, bboxA = obj_list[i][1]
                _, bboxB = obj_list[j][1]
                if is_intersecting(bboxA, bboxB):
                    intersected_pairs.add((obj_list[i][0], obj_list[j][0]))

        if intersected_pairs:
            # Optional: Annotate frame with info about intersections
            cv2.putText(processed_frame, "Intersection Detected", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            for idx, (idA, idB) in enumerate(intersected_pairs):
                cv2.putText(processed_frame, f"ID {idA} & ID {idB} intersect", (50, 80 + 20 * idx),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            # Preprocess current frame for violence detection and add to buffer
            resized_frame = cv2.resize(frame, frame_size) / 255.0
            # resized_frame = preprocess_input(frame)
            # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
            frames.append(resized_frame)
            
            # Predict when we have enough frames
            if len(frames) == frames_count:
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

                frames = []

            else:
                frames = []

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