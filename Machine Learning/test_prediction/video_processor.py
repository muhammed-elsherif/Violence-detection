import cv2
from violence_new_approach import Model

class VideoProcessor:
    def __init__(self, settings_path: str = './settings.yaml'):
        self.model = Model(settings_path) # initialize model
        self.violence_threshold = 0.5  # Higher threshold for violence detection
        self.frame_skip = 5  # Process every 5th frame for better performance
        
    def process_video(self, video_path: str, output_path: str = None):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % self.frame_skip == 0:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                prediction = self.model.predict(rgb_frame)
                
                label = prediction['label']
                confidence = prediction['confidence']
                
                if 'violence' in label.lower() and confidence > self.violence_threshold:
                    color = (0, 0, 255)  # Red for violence
                else:
                    color = (0, 255, 0)  # Green for non-violence
                    
                cv2.putText(frame, f"{label}: {confidence:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                
            if writer:
                writer.write(frame)
            cv2.imshow('Violence Detection', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
            frame_count += 1
            
        cap.release()
        if writer:
            writer.release()
        cv2.destroyAllWindows()
        
    def process_webcam(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise ValueError("Could not open webcam")
            
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % self.frame_skip == 0:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                prediction = self.model.predict(rgb_frame)
                
                label = prediction['label']
                confidence = prediction['confidence']
                
                if 'violence' in label.lower() and confidence > self.violence_threshold:
                    color = (0, 0, 255)  # Red for violence
                else:
                    color = (0, 255, 0)  # Green for non-violence
                    
                cv2.putText(frame, f"{label}: {confidence:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                
            cv2.imshow('Violence Detection - Webcam', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
            frame_count += 1
            
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    processor = VideoProcessor()
    
    processor.process_video("test_samples/violent/office_fight.mp4", "output/clip.mp4")
    
    # processor.process_webcam() 
