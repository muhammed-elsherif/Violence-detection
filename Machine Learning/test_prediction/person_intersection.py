import cv2
import numpy as np
from labels import LABELS
from centroid_tracker_streaming import CentroidTracker
tracker = CentroidTracker()

net = cv2.dnn.readNet("yolo_weights/yolov3.weights", "yolo_weights/yolov3.cfg")
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

    # Extract persons and track them
    # person_boxes = [boxes[i] for i in indices if LABELS[class_ids[i]] == "person"]
    # tracked_objects = tracker.update(person_boxes)

    # for objectID, (centroid, bbox) in tracked_objects.items():
    #     x, y, w, h = bbox
    #     label = f"ID {objectID}"
    #     color = (0, 255, 0)

    #     cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
    #     cv2.putText(image, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # return image, tracked_objects
    for i in indices:
            x, y, w, h = boxes[i]
            label = str(LABELS[class_ids[i]])
            confidence = confidences[i]
            color = COLORS[class_ids[i]]

            # Draw outer rectangle using OpenCV
            cv2.rectangle(image, (x, y), (x+w, y+h), color, 2)

            # Draw label and confidence using OpenCV
            text = f"{label}: {confidence:.2f}"
            cv2.putText(image, text, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    return image, class_ids, indices

def is_intersecting(boxA, boxB):
    """
        Check if two bounding boxes overlap.
        boxA and boxB format: [x, y, width, height]
    """
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
    yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])
    
    return xA < xB and yA < yB  # If true, they intersect
