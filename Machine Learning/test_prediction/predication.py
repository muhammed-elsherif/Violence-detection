import os
import cv2
import numpy as np
from person_intersection import yolo_detect, is_intersecting
from model_parameters import selected_model

yolo = False
model, frame_size, frames_count = selected_model(yolo)

def predict_and_display(video_path, model):
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_path='output/' + 'annotated_video.mp4'
    os.makedirs('output', exist_ok=True)  # Ensure the output directory exists

    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frames = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        if frame is None:
            print("Error: Captured frame is None")
            continue  # Skip this iteration

        if yolo:
            # Run YOLO model on the frame
            results = model(frame)
            # Annotate frame with detections
            annotated_frame = results[0].plot()

            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0]
                    cls = int(box.cls[0])
                    label = "Violence" if cls == 1 else "Non-Violence"
                    color = (0, 0, 255) if cls == 1 else (0, 255, 0)

                    cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                    cv2.putText(annotated_frame, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # **Write the processed frame to the output video**
            out.write(annotated_frame)

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

                # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
                resized_frame = cv2.resize(frame, frame_size) / 255.0
                frames.append(resized_frame)
                frame_count += 1

                if len(frames) == frames_count:
                    input_frames = np.expand_dims(np.array(frames), axis=0)
                    prediction = model.predict(input_frames)
                    predicted_label = np.argmax(prediction)
                    confidence = prediction[0][predicted_label]

                    if predicted_label == 1:  # Assuming 1 = Violence
                        cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 0, 255), 4)
                        cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    else:
                        cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                    out.write(frame)
                    frames = []
            else:
                # Even if there is no intersection, show the processed frame with bounding boxes
                out.write(processed_frame)

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    print(f"Processed video saved at {output_path}")
    return output_path

def play_video(filepath):
    if os.path.exists(filepath):
        # os.system(f"start {filepath}")  # Windows
        os.system(f"open {filepath}")   # macOS
        # os.system(f"xdg-open {filepath}")  # Linux
    else:
        print("Error: File not found!", filepath)

# video_path = 'test_samples/normal/1.mp4'
# video_path = 'test_samples/normal/4.mp4'
# video_path = 'test_samples/normal/people.mp4'
# video_path = 'test_samples/normal/people2.mp4'
# video_path = 'test_samples/violent/V_19.mp4'
# video_path = 'test_samples/violent/0.mp4'
video_path = 'test_samples/violent/office_fight.mp4'
result_path = predict_and_display(video_path, model)

play_video(result_path)