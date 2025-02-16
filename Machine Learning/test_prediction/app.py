# fastapi_app.py
import os
import uuid
import shutil
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from tensorflow.keras.models import load_model

app = FastAPI()

# Load the trained model at startup (no changes needed)
model_name = 'mobileNet'
model_path = os.path.join('..', 'loaded_models', f'{model_name}_violence_detection_model.h5')
model = load_model(model_path)

FRAME_SIZE = (112, 112)
NUM_FRAMES = 10

def predict_and_annotate_video(video_path: str, model) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    # Ensure the output folder exists
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    output_filename = os.path.join(output_dir, f"{model_name}_{uuid.uuid4().hex}.mp4")

    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))
    frames = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Preprocess frame
        resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0
        frames.append(resized_frame)

        # Once we have enough frames, run prediction
        if len(frames) == NUM_FRAMES:
            input_frames = np.expand_dims(np.array(frames), axis=0)
            prediction = model.predict(input_frames)
            predicted_label = np.argmax(prediction)
            confidence = prediction[0][predicted_label]

            if predicted_label == 1:  # Assuming label 1 = Violence
                cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 0, 255), 4)
                cv2.putText(
                    frame,
                    f"Violence Detected ({confidence:.2f})",
                    (60, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 0, 255),
                    2,
                )
            else:
                cv2.putText(
                    frame,
                    f"Non-Violence ({confidence:.2f})",
                    (60, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 255, 0),
                    2,
                )

            out.write(frame)
            frames = []

    cap.release()
    out.release()
    return output_filename

def predict_and_annotate_image(image_path: str, model) -> str:
    img = cv2.imread(image_path)
    resized_img = cv2.resize(img, FRAME_SIZE) / 255.0
    input_img = np.expand_dims(resized_img, axis=0)
    prediction = model.predict(input_img)
    predicted_label = np.argmax(prediction)
    confidence = prediction[0][predicted_label]

    if predicted_label == 1:
        cv2.rectangle(img, (10, 10), (img.shape[1]-10, img.shape[0]-10), (0, 0, 255), 2)
        cv2.putText(
            img,
            f"Violence Detected ({confidence:.2f})",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2,
        )
    else:
        cv2.putText(
            img,
            f"Non-Violence ({confidence:.2f})",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2,
        )

    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    output_filename = os.path.join(output_dir, f"{model_name}_{uuid.uuid4().hex}.jpg")
    cv2.imwrite(output_filename, img)
    return output_filename

@app.post("/predict_video")
async def predict_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video = predict_and_annotate_video(temp_video_path, model)
    except Exception as e:
        os.remove(temp_video_path)
        raise HTTPException(status_code=500, detail=str(e))

    os.remove(temp_video_path)
    return FileResponse(output_video, media_type="video/mp4", filename=os.path.basename(output_video))

@app.post("/predict_image")
async def predict_image(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    # Save the uploaded image temporarily
    temp_image_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_image = predict_and_annotate_image(temp_image_path, model)
    except Exception as e:
        os.remove(temp_image_path)
        raise HTTPException(status_code=500, detail=str(e))

    os.remove(temp_image_path)
    return FileResponse(output_image, media_type="image/jpeg", filename=os.path.basename(output_image))
