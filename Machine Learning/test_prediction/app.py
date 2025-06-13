import os
import cv2
import json
import uuid
import asyncio
import shutil
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from object_detection.yolo import yolo_detect, LABELS as LABELS_YOLO
from model_parameters import selected_model, process_video
from crash_detection import CarAccidentDetectionProcessor
from config import CONFIDENCE_THRESHOLD, VIDEO_OUTPUT_DIR, FRAME_SIZE, NUM_FRAMES, client
from pydantic import BaseModel
from together.error import RateLimitError
import re
from video_processor import VideoProcessor

app = FastAPI()

# Load the trained model at startup (no changes needed)
model = selected_model()
gun_model = selected_model(True)
fire_model = selected_model(fire_detection=True)
os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True)

def predict_and_annotate_violence_video(video_path: str, model=model) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{uuid.uuid4().hex}.mp4")

    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))

    ### predict by video
    frames = process_video(video_path) # shape: (FRAMES, H, W, 3)
    input_frames = np.expand_dims(frames, axis=0) # shape: (1, FRAMES, H, W, 3)
    prediction = model.predict(input_frames) # shape: (NUM_CLASSES,)
    predicted_label = np.argmax(prediction)
    confidence = prediction[0][predicted_label]
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    ret, frame = cap.read()
    if not ret:
        raise HTTPException(status_code=400, detail="Invalid video file")

    if predicted_label == 1 and confidence > 0.65:  # Assuming label 1 = Violence
        cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 0, 255), 4)
        cv2.putText(frame, f"Violence Detected ({confidence:.2f})", (60, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    else:
        cv2.rectangle(frame, (50, 50), (width - 50, height - 50), (0, 255, 0), 4)
        cv2.putText(frame, f"Non-Violence ({confidence:.2f})", (60, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    out.write(frame)

    cap.release()
    out.release()

    # avg_confidence = np.mean(confidence_scores) if confidence_scores else 0.0
    avg_confidence = confidence
    os.system(f"open {output_filename}")
    detection_results = {
        "overallStatus": "VIOLENCE_DETECTED" if predicted_label == 1 else "NON_VIOLENCE",
        "overallConfidence": float(avg_confidence),
        "violentFrames": 0,
        "totalFrames": total_frames,
    }
    return output_filename, detection_results

def predict_and_annotate_video_object(video_path: str) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{uuid.uuid4().hex}.mp4")

    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        annotated_frame, class_ids, indices = yolo_detect(frame, CONFIDENCE_THRESHOLD)
        # results = model.predict(processed_frame, conf=0.6)
        # annotated_frame = results[0].plot()
        out.write(annotated_frame) # Gun / Object

    cap.release()
    out.release()

    os.system(f"open {output_filename}")
    detection_results = {
        "uniqueObjects": list(set(LABELS_YOLO[class_ids[i]] for i in indices.flatten())),
        "totalFrames": total_frames,
    }
    return output_filename, detection_results

def predict_and_annotate_video_gun(video_path: str) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{uuid.uuid4().hex}.mp4")

    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))

    predicted_label = 0
    total_confidence = 0.0
    gun_detections = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = gun_model.predict(frame, conf=CONFIDENCE_THRESHOLD)
        annotated_frame = results[0].plot()
        out.write(annotated_frame) # Gun

        for box in results[0].boxes:
            class_id = int(box.cls[0])
            conf = float(box.conf[0])
            # Assuming 'gun' has class ID 0; update this if needed
            if class_id == 0 and conf > 0.7:
                predicted_label = 1
                gun_detections += 1
                total_confidence += conf

    cap.release()
    out.release()

    avg_confidence = (total_confidence / gun_detections) if gun_detections > 0 else 100.0

    os.system(f"open {output_filename}")
    detection_results = {
        "overallStatus": "GUN_DETECTED" if predicted_label == 1 else "NO_GUN",
        "overallConfidence": round(avg_confidence, 3),
        "numberOfGuns": gun_detections,
        "totalFrames": total_frames,
    }
    return output_filename, detection_results

def predict_and_annotate_video_fire(video_path: str) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{uuid.uuid4().hex}.mp4")

    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))

    predicted_label = 0
    total_confidence = 0.0
    fire_detections = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = fire_model.predict(frame, conf=CONFIDENCE_THRESHOLD)
        out.write(results[0].plot())

        for box in results[0].boxes:
            class_id = int(box.cls[0])
            conf = float(box.conf[0])
            # Assuming 'fire' has class ID 0; update this if needed
            if class_id == 0 and conf > 0.7:
                predicted_label = 1
                fire_detections += 1
                total_confidence += conf

    cap.release()
    out.release()

    avg_confidence = (total_confidence / fire_detections) if fire_detections > 0 else 100.0
    
    os.system(f"open {output_filename}")
    detection_results = {
        "overallStatus": "FIRE_DETECTED" if predicted_label == 1 else "NO_FIRE",
        "overallConfidence": round(avg_confidence, 3),
        "totalFrames": total_frames,
    }
    return output_filename, detection_results

def predict_and_annotate_video_crash(video_path: str) -> str:
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{uuid.uuid4().hex}.mp4")

    processor = CarAccidentDetectionProcessor(video_path, output_video_file=output_filename)  # Create processor instance
    processor.start_processing()
    out = cv2.VideoWriter(output_filename, fourcc, fps, (width, height))

    predicted_label = 0
    total_confidence = 0.0
    fire_detections = 0

    cap.release()
    out.release()

    avg_confidence = (total_confidence / fire_detections) if fire_detections > 0 else 100.0

    detection_results = {
        "overallStatus": "FIRE_DETECTED" if predicted_label == 1 else "NO_FIRE",
        "overallConfidence": round(avg_confidence, 3),
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
        cv2.putText(img, f"Violence Detected ({confidence:.2f})", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    else:
        cv2.putText(img, f"Non-Violence ({confidence:.2f})", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{model}_{uuid.uuid4().hex}.jpg")
    cv2.imwrite(output_filename, img)
    return output_filename, detection_results

@app.post("/violence_detection_clip")
async def predict_and_annotate_violence_video_clip(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    processor = VideoProcessor()
    output_filename = os.path.join(VIDEO_OUTPUT_DIR, f"{uuid.uuid4().hex}.mp4")
    processor.process_video(temp_video_path, output_filename)
    os.remove(temp_video_path)
    return FileResponse(output_filename, media_type="video/mp4", filename=os.path.basename(output_filename))

@app.post("/violence_detection")
async def predict_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_violence_video(temp_video_path, model)
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

@app.post("/object_detection")
async def predict_object(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_video_object(temp_video_path)
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
    
@app.post("/gun_detection")
async def predict_object(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_video_gun(temp_video_path)
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

@app.post("/fire_detection")
async def predict_object(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_video_fire(temp_video_path)
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
    
@app.post("/crash_detection")
async def predict_object(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_video_crash(temp_video_path)
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

@app.post("/predict_stream")
async def predict_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    # Save the uploaded video temporarily
    temp_video_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        output_video, detection_results = predict_and_annotate_violence_video(temp_video_path, model)
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

class RecommendationRequest(BaseModel):
    company_name: str
    use_case: str

async def fetch_recommendation(messages, max_retries: int = 5):
    """
    Attempt to fetch a recommendation stream with exponential backoff on rate limits.
    """
    delay = 1
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
                messages=messages,
                stream=True
            )
        except RateLimitError:
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay *= 2
            else:
                raise

@app.post("/recommend_model")
async def recommend_model(req: RecommendationRequest):

    with open("prompts/model_recommendation.txt", "r") as f:
            prompt_template = f.read()

    system_prompt = (prompt_template)

    user_message = (
        f"Company Name : {req.company_name}\n"
        f"Use Case : {req.use_case}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    try:
        response_stream = await fetch_recommendation(messages)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded, please try again later.")

    # collect the streamed tokens into one string
    result = []
    for token in response_stream:
        if hasattr(token, "choices") and token.choices:
            delta = token.choices[0].delta.content
            if delta:
                result.append(delta)

    model_choice = "".join(result).strip()

    if not model_choice:
        raise HTTPException(status_code=500, detail="Failed to retrieve a model recommendation.")

    # extract tags from model_choice
    models = re.findall(r'<models>(.*?)</models>', model_choice, re.DOTALL)
    chosen = re.findall(r'<chosen>(.*?)</chosen>', model_choice, re.DOTALL)
    explanation = re.findall(r'<explanation>(.*?)</explanation>', model_choice, re.DOTALL)

    return {
        "models": models,
        "recommended_model": chosen,
        "explanation": explanation
    }
