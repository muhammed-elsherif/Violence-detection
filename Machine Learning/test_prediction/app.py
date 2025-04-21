import json
import os
import uuid
import shutil
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from model_parameters import selected_model, process_video
from config import NUM_FRAMES, FRAME_SIZE, VIDEO_OUTPUT_DIR

app = FastAPI()

# Load the trained model at startup (no changes needed)
model = selected_model()
# model_name = os.path.splitext(model)[0]  # removes .h5

def predict_and_annotate_video(video_path: str, model) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    # Ensure the output folder exists
    os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True)
    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{model_name}_{uuid.uuid4().hex}.mp4")

    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))

    frames = []
    violent_frames = 0
    total_frames = 0

    ### predict by video
    frames = process_video(video_path) # shape: (FRAMES, H, W, 3)
    input_frames = np.expand_dims(frames, axis=0) # shape: (1, FRAMES, H, W, 3)
    prediction = model.predict(input_frames) # shape: (NUM_CLASSES,)
    predicted_label = np.argmax(prediction)
    confidence = prediction[0][predicted_label]
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Preprocess frame
        # total_frames += 1
        # resized_frame = cv2.resize(frame, FRAME_SIZE) / 255.0
        # frames.append(resized_frame)

        # Once we have enough frames, run prediction
        # if len(frames) == NUM_FRAMES:
        #     input_frames = np.expand_dims(np.array(frames), axis=0)
        #     prediction = model.predict(input_frames)
        #     predicted_label = np.argmax(prediction)
        #     confidence = prediction[0][predicted_label]

        # confidence_scores.append(confidence)
        if predicted_label == 1:  # Assuming label 1 = Violence
            # violent_frames += NUM_FRAMES  # Assume entire batch is violent
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

    # avg_confidence = np.mean(confidence_scores) if confidence_scores else 0.0
    avg_confidence = confidence
    detection_results = {
        "overallStatus": "VIOLENCE_DETECTED" if predicted_label == 1 else "NON_VIOLENCE",
        "overallConfidence": float(avg_confidence),
        "violentFrames": violent_frames,
        "totalFrames": total_frames,
    }
    return output_filename, detection_results

def predict_and_annotate_image(image_path: str, model) -> str:
    img = cv2.imread(image_path)
    resized_img = cv2.resize(img, FRAME_SIZE) / 255.0
    input_img = np.expand_dims(resized_img, axis=0)
    prediction = model.predict(input_img)
    predicted_label = np.argmax(prediction)
    confidence = prediction[0][predicted_label]

    detection_results = {
        "overallStatus": "VIOLENCE_DETECTED" if predicted_label == 1 else "NON_VIOLENCE",
        "overallConfidence": float(confidence),
    }

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
    return output_filename, detection_results

@app.post("/predict_video")
async def predict_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_video(temp_video_path, model)
        response = FileResponse(
            output_video,
            media_type="video/mp4",
            filename=os.path.basename(output_video),
            headers={
                "X-Detection-Results": json.dumps(detection_results)
            }
        )
        os.remove(temp_video_path)
        return response
    except Exception as e:
        os.remove(temp_video_path)
        raise HTTPException(status_code=500, detail=str(e))

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
