# 🔍 Real-Time Violence Detection System

This project uses deep learning to detect violent activities in video files or real-time webcam feeds. It supports two modes:

YOLO-based object detection

Sequence-based video classification using CNN+LSTM

## 🎯 Project Goals

- Detect violent activities in videos or webcam streams.
- Provide real-time feedback with bounding boxes and confidence scores.
- Support both YOLO-based detection and deep learning model-based classification.

---

## 📁 Directory Structure

```bash
.
├── person_intersection.py         # YOLO detection and person tracking utilities
├── model_parameters.py           # Model selection and preprocessing logic
├── predict_and_display.py        # Batch video violence detection
├── streaming.py                  # Streamlit app for real-time webcam inference
├── test_samples/                # Folder for sample input videos
│   ├── normal/
│   └── violent/
│   └── crash/
├── output/                      # Stores output annotated videos
├── README.md
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/muhammed-elsherif/Violence-detection.git
```
```bash
cd Machine\ Learning/test_prediction/ # todo change folder name
```

2. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```
In case of running backend:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```
add `--reload` in dev mode.

## 🚀 Usage
### ▶️ Predict from video file
```bash
python predication.py
```
You can edit the `video_path` variable in `predication.py` to switch between normal and violent test samples.

🎥 Real-time webcam inference (via Streamlit)
```bash
streamlit run streaming.py
```
> Opens a Streamlit interface that shows webcam output and real-time detection.

## 📊 Model Details
- YOLO is used for object detection (e.g., identifying humans, guns, knives, etc.).

- MobileNet or Custom LSTM-CNN models are used for frame-based video classification.

- model_parameters.py allows toggling between YOLO and deep learning classification.

## ✅ Features
📹 Real-time detection via webcam.

🎞️ Offline detection for uploaded videos.

📦 Annotates frames with confidence scores and labels.

🧠 Modular design for easy extension and experimentation.

## ⚙️ Configuration
Set `yolo = True` in either `predication.py` or `streamlit_app.py` to enable YOLO detection. Set to False to use frame-based classification.

🧪 Sample Videos
- Normal: test_samples/normal/people.mp4

- Violent: test_samples/violent/office_fight.mp4

>>> Feel free to add your own videos for testing!

## 📌 Requirements
- Python 3.7+
- TensorFlow / Keras
- OpenCV
- NumPy
- Streamlit

```bash
pip install -r requirements.txt
```
