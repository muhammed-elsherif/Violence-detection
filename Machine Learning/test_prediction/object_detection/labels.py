import random
import numpy as np

def load_labels(filename):
    with open(filename, 'r') as file:
        labels = file.read().strip().split("\n")
    return labels

# Define COCO labels
LABELS = load_labels("object_detection/coco.names")

# Generate random colors for each class
np.random.seed(42)  # For consistent colors
COLORS = np.random.randint(0, 255, size=(len(LABELS), 3), dtype="uint8").tolist()