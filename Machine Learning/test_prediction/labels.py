import random
import numpy as np

def load_labels(filename):
    with open(filename, 'r') as file:
        labels = file.read().strip().split("\n")
    return labels

# Define COCO labels
LABELS = load_labels("coco.names")

# Assign a color to each label
random.seed(42)
COLORS = np.random.uniform(0, 255, size=(len(LABELS), 3))