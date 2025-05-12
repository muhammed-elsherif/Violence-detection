import cv2
import numpy as np
import face_recognition
import os
import glob

class EnhancedFaceRecognition:
    def __init__(self, confidence_threshold=0.6):
        self.known_face_encodings = []
        self.known_face_names = []
        self.confidence_threshold = confidence_threshold
    
    def load_encoding_images(self, images_path):
        """Load known face encodings and names."""
        images_path = glob.glob(os.path.join(images_path, "*.*"))
        print(f"{len(images_path)} encoding images found.")

        for img_path in images_path:
            print(f"Processing image: {img_path}")
            img = cv2.imread(img_path)
            
            if img is None:
                print(f"Warning: Could not load image {img_path}")
                continue
                
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_img)
            
            if encodings:
                name = os.path.splitext(os.path.basename(img_path))[0]
                self.known_face_encodings.append(encodings[0])
                self.known_face_names.append(name)
            else:
                print(f"No face detected in {img_path}")

    def detect_known_faces(self, frame):
        """Detect known faces in a frame."""
        face_locations = face_recognition.face_locations(frame)
        face_encodings = face_recognition.face_encodings(frame, face_locations)
        
        face_names = []
        face_confidences = []
        
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
            
            if len(face_distances) > 0:
                confidence = 1 - min(face_distances)
                best_match_index = np.argmin(face_distances)
                
                if confidence >= self.confidence_threshold and matches[best_match_index]:
                    name = self.known_face_names[best_match_index]
                else:
                    name = "Unknown"
                    
                face_names.append(name)
                face_confidences.append(confidence)
            
        return face_locations, face_names, face_confidences

    def draw_face_info(self, frame, face_loc, name, confidence):
        """Draw bounding box and recognition info on the frame."""
        y1, x2, y2, x1 = face_loc[0], face_loc[1], face_loc[2], face_loc[3]

        # Determine color based on recognition status
        if name == "Unknown":
            color = (0, 0, 255)  # Red
        else:
            # Create a gradient from yellow to green based on confidence
            green = int(255 * min(confidence * 1.5, 1))
            red = int(255 * (1 - confidence))
            color = (0, green, red)

        # Draw rectangle around face
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 4)

        # Create info text
        info_text = f"{name} ({confidence:.1%})" if name != "Unknown" else "Unknown"

        # Add background for text
        text_size = cv2.getTextSize(info_text, cv2.FONT_HERSHEY_DUPLEX, 0.8, 2)[0]
        cv2.rectangle(frame, (x1, y1 - text_size[1] - 10), (x1 + text_size[0], y1), color, -1)

        # Draw text
        cv2.putText(frame, info_text, (x1, y1 - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 2)

def process_image(known_faces_path, confidence_threshold=0.6):
    """Process a test image and display the annotated result."""
    # Initialize face recognition
    sfr = EnhancedFaceRecognition(confidence_threshold=confidence_threshold)
    sfr.load_encoding_images(known_faces_path)
    
    # Load test image
    # frame = cv2.imread(test_image_path)
    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        if frame is None:
            print(f"Error: Could not load image")
            return
        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)
    
        # Detect faces
        face_locations, face_names, face_confidences = sfr.detect_known_faces(frame)
        
        # Annotate the frame
        for face_loc, name, confidence in zip(face_locations, face_names, face_confidences):
            sfr.draw_face_info(frame, face_loc, name, confidence)

            print(name)
        
        # Display the result
        cv2.imshow("Face Recognition Result", frame)
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    known_faces_path = "test_samples"  # Directory with known face images
    
    # Process the test image
    process_image(known_faces_path, confidence_threshold=0.6)