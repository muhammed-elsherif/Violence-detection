import cv2
import numpy as np
from tensorflow.keras.models import load_model
import os

# Load the trained model
model_name = 'mobileNet'
model_path = '../loaded_models/' + model_name + '_violence_detection_model.h5' # adjust with ur model path
model = load_model(model_path)

FRAME_SIZE = (112, 112)
NUM_FRAMES = 1

def predict_and_display(video_path, model):
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_path='output/' + model_name + '2.mp4'

    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frames = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0
        frames.append(resized_frame)
        frame_count += 1

        if len(frames) == NUM_FRAMES:
            input_frames = np.expand_dims(np.array(frames), axis=0)
            prediction = model.predict(input_frames)
            predicted_label = np.argmax(prediction)
            confidence = prediction[0][predicted_label]

            if predicted_label == 1:  # Assuming 1 = Violence
                cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 0, 255), 4)
                cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            else:
                cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            out.write(frame)
            frames = []

    cap.release()
    out.release()

    print(f"Processed video saved at {output_path}")
    return output_path

def play_video(filepath):
    if os.path.exists(filepath):
        # os.system(f"start {filepath}")  # Windows
        os.system(f"open {filepath}")   # macOS
        # os.system(f"xdg-open {filepath}")  # Linux
    else:
        print("Error: File not found!", filepath)

# video_path = 'test_samples/normal/people.mp4'
video_path = 'test_samples/violent/office_fight.mp4'
result_path = predict_and_display(video_path, model)

play_video(result_path)