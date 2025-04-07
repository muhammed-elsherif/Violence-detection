# --- Parameters for violence detection ---
# FRAME_SIZE should match your model's expected input size (e.g., (224, 224))
# FRAME_SIZE = (64, 64)
FRAME_SIZE = (112, 112)
# FRAME_SIZE = (224, 224)
NUM_FRAMES = 16

YOLO_ENABLED = False
CONFIDENCE_THRESHOLD = 0.6
VIDEO_OUTPUT_DIR = 'output'