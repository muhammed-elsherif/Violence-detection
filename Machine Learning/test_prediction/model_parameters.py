from ultralytics import YOLO
from tensorflow.keras.models import load_model

def selected_model(yolo=False):
    # --- Parameters for violence detection ---
    # FRAME_SIZE should match your model's expected input size (e.g., (224, 224))
    FRAME_SIZE = (224, 224)
    NUM_FRAMES = 1

    # Load all trained models
    if yolo:
        # model_path = "../loaded_models/yolo_best.pt"
        # model_path = "../loaded_models/best.pt"
        model_path = "../loaded_models/violence_weights.pt" # best
        model = YOLO(model_path)
    else:
        # model_name = '../loaded_models/inceptionV3_violence_detection_model.h5'
        # model_name = '../loaded_models/model_3d_violence_detection_model.h5'
        # model_name = '../loaded_models/modelnew.h5'
        # model_name = '../loaded_models/violence_detection_model.h5'

        ### MobileNetV2
        # model_name = '../loaded_models/mobileNet_violence_detection_model.h5'
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model.h5'
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model_latest.h5'
        # model_name = '../loaded_models/mobileNetV2_violence_detection_model_new.h5'
        # model_name = '../loaded_models/violence_detection_model_latest.h5'
        # model_name = '../loaded_models/violence_detection_model_latest_best.h5'
        # model_name = '../loaded_models/violence_detection_model (1).h5'
        # model_name = '../loaded_models/violence_detection_model_latest2.h5'
        # model_name = '../loaded_models/violence_detection_model_layers_and_augmentation.h5'
        # model_name = '../loaded_models/violence_detection_model_layers2_and_augmentation.h5'
        # model_name = '../loaded_models/violence_detection_model_layers3_and_augmentation.h5'
        # model_name = '../loaded_models/violence_detection_model_layers.h5'
        # model_name = '../loaded_models/violence_detection_model_layers3.h5'
        # model_name = '../loaded_models/violence_detection_model_layers4.h5'
        model_name = '../loaded_models/violence_detection_model_layers_final.h5'
        model = load_model(model_name)
    return model, FRAME_SIZE, NUM_FRAMES