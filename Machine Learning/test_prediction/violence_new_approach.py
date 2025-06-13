import open_clip
import numpy as np
import torch
import yaml
from PIL import Image


class Model:
    def __init__(self, settings_path: str = './settings.yaml'):
        with open(settings_path, 'r') as f:
            self.settings = yaml.safe_load(f)

        self.model_name =  self.settings['model-settings']['model-name']
        self.device = self.settings['model-settings']['device']
        self.prediction_threshold = self.settings['model-settings']['prediction-threshold']
        
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            self.model_name,
            pretrained='openai',
            device=self.device
        )
        
        self.labels = self.settings['label-settings']['labels']
        self.default_label = self.settings['label-settings']['default-label'] # unknown
        
        self.labels = [f"a photo of {label}" for label in self.labels]
        
        text_tokens = open_clip.tokenize(self.labels).to(self.device)
        with torch.no_grad():
            self.text_features = self.model.encode_text(text_tokens)
            self.text_features /= self.text_features.norm(dim=-1, keepdim=True)
            
    def predict(self, image: np.ndarray) -> dict:
        """
        Predict the label for an input image
        
        Args:
            image (np.ndarray): Input image in RGB format
            
        Returns:
            dict: Prediction results with label and confidence
        """
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
            
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            image_features = self.model.encode_image(image_input)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            
        similarity = (100.0 * image_features @ self.text_features.T).softmax(dim=-1)
        values, indices = similarity[0].topk(1)
        
        confidence = values[0].item()
        if confidence > self.prediction_threshold:
            label = self.labels[indices[0]].replace("a photo of ", "")
        else:
            label = self.default_label
            
        return {
            'label': label,
            'confidence': confidence
        }
