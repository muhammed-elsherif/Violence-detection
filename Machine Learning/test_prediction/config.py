from together import Together
import os

# --- Parameters for violence detection ---
# FRAME_SIZE should match your model's expected input size (e.g., (224, 224))
# FRAME_SIZE = (64, 64)
FRAME_SIZE = (112, 112)
# FRAME_SIZE = (224, 224)
NUM_FRAMES = 16

# Toggle the flog `DONOT` comment it
YOLO_ENABLED = False
GUN_DETECTION_ENABLED = False
FIRE_DETECTION_ENABLED = False
OBJECT_DETECTION_ENABLED = False
FACE_DETECTION_ENABLED = False
CRASH_DETECTION_ENABLED = False

CONFIDENCE_THRESHOLD = 0.6
VIDEO_OUTPUT_DIR = 'output'

client = Together(api_key="86346bfda084ee6c73bc164752b6c9962cacd0c0a31e7e1ea31cd3609a901b2c")

# Together API Configuration
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "f565c78db8fb04705e787ceed5990cad79e48b47ad34b785c79e66a91fef4ae7")
