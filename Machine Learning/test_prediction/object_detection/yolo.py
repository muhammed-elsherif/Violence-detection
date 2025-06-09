import cv2
import numpy as np
from object_detection.labels import LABELS, COLORS

# Load YOLOv3 model
net = cv2.dnn.readNet("object_detection/yolov3.weights", "object_detection/yolov3.cfg")
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

def yolo_detect(image, confidence_threshold):
    (H, W) = image.shape[:2]

    # Preprocess image for YOLO
    blob = cv2.dnn.blobFromImage(image, 0.00392, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)

    # Get YOLO output
    layer_outputs = net.forward(output_layers)

    boxes = []
    confidences = []
    class_ids = []

    for output in layer_outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > confidence_threshold:
                box = detection[0:4] * np.array([W, H, W, H])
                (centerX, centerY, width, height) = box.astype("int")
                x = int(centerX - (width / 2))
                y = int(centerY - (height / 2))
                boxes.append([x, y, int(width), int(height)])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    indices = np.array(indices).flatten() if len(indices) > 0 else np.array([])

    # Draw bounding boxes and labels on the image
    for i in indices:
        x, y, w, h = boxes[i]
        label = str(LABELS[class_ids[i]])
        confidence = confidences[i]
        color = COLORS[class_ids[i]]

        # Draw outer rectangle using OpenCV and make box bigger
        cv2.rectangle(image, (x, y), (x+w, y+h), color, 5)

        # Draw label and confidence using OpenCV
        text = f"{label}: {confidence:.2f}"
        cv2.putText(image, text, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    return image, class_ids, indices
