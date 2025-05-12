import cv2
import os
import random
import numpy as np
from ultralytics import YOLO
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from config import NUM_FRAMES, FRAME_SIZE, GUN_DETECTION_ENABLED, FACE_DETECTION_ENABLED, YOLO_ENABLED, FIRE_DETECTION_ENABLED

def selected_model(gun_detection=False, fire_detection=False):
    # Load all trained models
    if YOLO_ENABLED:
        model_path = "../loaded_models/yolo_best.pt"
        model_path = "../loaded_models/violoence_best.pt"
        model_path = "../loaded_models/vil_best.pt"
        model_path = "../loaded_models/violence_weights.pt" # best
        model = YOLO(model_path)
    elif GUN_DETECTION_ENABLED or gun_detection:
        model_path = "../loaded_models/gun_best.pt" # working
        model = YOLO(model_path)
    elif FIRE_DETECTION_ENABLED or fire_detection:
        model_path = "../loaded_models/fire.pt" # working
        model = YOLO(model_path)
    else:
        # model_name = '../loaded_models/inceptionV3_violence_detection_model.h5'
        # model_name = '../loaded_models/inceptionV3_violence_detection_model_with95.h5'
        # model_name = '../loaded_models/inceptionV3_violence_detection_model_with99.h5'
        # model_name = '../loaded_models/inceptionV3_violence_detection_model_with99-second.h5'
        # model_name = '../loaded_models/inceptionV3_violence_detection_model_with99_with_augmentation_and_30layers.h5'
        # model_name = '../loaded_models/model_3d_violence_detection_model.h5'
        # model_name = '../loaded_models/modelnew.h5' # body
        # model_name = '../loaded_models/violence_detection_model.h5'

        ### MobileNetV2
        # model_name = '../loaded_models/mobileNet_violence_detection_model.h5' # 112x112
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model.h5'
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model_latest.h5'
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model_new.h5'
        # model_name = '../loaded_models/violence_detection_model_latest.h5' # bad
        # model_name = '../loaded_models/violence_detection_model_latest_best.h5' # good
        # model_name = '../loaded_models/violence_detection_model (1).h5' # bad
        # model_name = '../loaded_models/violence_detection_model_latest2.h5' # bad
        # model_name = '../loaded_models/violence_detection_model_layers_and_augmentation.h5' # ygy mno 50%
        model_name = '../loaded_models/violence_detection_model_layers2_and_augmentation.h5' # better in non violence ::
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model_preprocess112.h5'
        # model_name = '../loaded_models/violence_detection_model-aug-dense.h5'
        # model_name = '../loaded_models/violence_detection_model_layers3_and_augmentation.h5' # not bad not good
        # model_name = '../loaded_models/violence_detection_model_layers.h5' # bad
        # model_name = '../loaded_models/violence_detection_model_layers3.h5' # not bad
        # model_name = '../loaded_models/violence_detection_model_layers4.h5' # bad
        # model_name = '../loaded_models/violence_detection_model_layers_final.h5' # bad
        # model_name = '../loaded_models/violence_detection_model-latest.h5' # good high cameras
        # model_name = '../loaded_models/violence_detection_model-latest-final.h5' # ygy mno
        # model_name = '../loaded_models/violence_detection_model-latest-final-5.h5' # 50% bad
        # model_name = '../loaded_models/violence_detection_model-latest-final-isa.h5' # bad
        # model_name = '../loaded_models/violence_detection_model-latest-final-adam.h5'
        # model_name = '../loaded_models/violence_detection_model-aug.h5'
        # model_name = '../loaded_models/violence_detection_model-aug22.h5'
        # model_name = '../loaded_models/violence_detection_model-95%.h5'
        # model_name = '../loaded_models/violence_detection_model-95-gl%.h5'
        # model_name = '../loaded_models/violence_detection_model-96%.h5'
        # model_name = '../loaded_models/mobileNet-latest-final.h5' # bad
        # model_name = '../loaded_models/mobileNet-latest-LRCN-2.h5' # not bad
        # model_name = '../loaded_models/mobileNet-latest-LRCN-3.h5' # not good
        # model_name = '../loaded_models/mobileNet-latest-final-2.h5' # not sure
        # model_name = '../loaded_models/mobileNet-latest-final-3 copy.h5' # body
        # model_name = '../loaded_models/mobileNet-latest-final-3.h5' # body
        # model_name = '../loaded_models/cancer_detection_model.h5' # body
        # model_name = '../loaded_models/lung_colon_cancer_detection_model.h5' # body
        model = load_model(model_name, compile=False)

    return model

# Data augmentation
augmentor = ImageDataGenerator(
    rotation_range=10,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=[0.8, 1.2],
    horizontal_flip=True
)

def process_video(video_path, frame_count=NUM_FRAMES, frame_size=FRAME_SIZE):
    """
    Loads a video from disk, extracts a fixed number of frames,
    resizes them and scales pixel values.
    """
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_skip = max(1, total_frames // frame_count)

    frames = []
    extracted_frames = 0

    while cap.isOpened() and len(frames) < frame_count:
        success, frame = cap.read()
        if not success:
            break
        # cap.set(cv2.CAP_PROP_POS_FRAMES, extracted_frames * frame_skip)
        # frame = cv2.resize(frame, frame_size) / 255.0
        # frames.append(frame)
        if extracted_frames % frame_skip == 0:
            frame = cv2.resize(frame, frame_size) / 255.0
            frames.append(frame)
        #     # Optional augmentation
        #     if random.random() < 0.5:
        #         frame = np.expand_dims(frame, axis=0)
        #         frame = next(augmentor.flow(frame, batch_size=1))[0]
        # frame = cv2.resize(frame, frame_size)
        # frame = preprocess_input(frame)  # Normalize for MobileNet
        extracted_frames += 1

    cap.release()

    # If fewer frames than expected, repeat the last frame
    while len(frames) < frame_count:
        frames.append(frames[-1])

    return np.array(frames)
