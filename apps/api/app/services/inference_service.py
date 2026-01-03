import os
import numpy as np
from typing import List, Dict
from app.ml.model import StressLSTM, extract_features

class InferenceService:
    """Service for real-time stress inference"""
    
    def __init__(self):
        self.model = None
        self.use_model = False
        self.sequence_buffer = []
        self.seq_len = 30
        self.load_model()
    
    def load_model(self):
        """Load the trained LSTM model"""
        try:
            self.model = StressLSTM(input_dim=6, hidden_dim=32, output_dim=1)
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'ml')
            model_path = os.path.join(model_dir, 'stress_model.json')
            
            if os.path.exists(model_path):
                print(f"Loading model from {model_path}")
                self.model.load_state_dict(model_path)
                self.use_model = True
                print("Model loaded successfully!")
            else:
                print(f"Model file not found at {model_path}, using heuristic fallback")
                self.use_model = False
        except Exception as e:
            print(f"Error loading model: {e}")
            self.use_model = False
    
    def predict(self, face_data: Dict) -> Dict:
        """
        Predict stress level from face data
        Returns: {stress_score: float, stress_level: str, confidence: float}
        """
        features = extract_features(face_data)
        
        if self.use_model and self.model:
            # Add to sequence buffer
            self.sequence_buffer.append(features)
            if len(self.sequence_buffer) > self.seq_len:
                self.sequence_buffer.pop(0)
            
            # Need full sequence for prediction
            if len(self.sequence_buffer) == self.seq_len:
                stress_score = self.model.forward(self.sequence_buffer)
                confidence = 0.85
            else:
                # Not enough data yet, use heuristic
                stress_score = self._heuristic_prediction(features)
                confidence = 0.5
        else:
            # Fallback to heuristic
            stress_score = self._heuristic_prediction(features)
            confidence = 0.6
        
        # Determine stress level
        if stress_score < 30:
            stress_level = "Low"
        elif stress_score < 70:
            stress_level = "Medium"
        else:
            stress_level = "High"
        
        return {
            "stress_score": float(stress_score),
            "stress_level": stress_level,
            "confidence": confidence
        }
    
    def _heuristic_prediction(self, features: List[float]) -> float:
        """Simple heuristic-based stress prediction"""
        blink_rate, eye_openness, jaw_clench, brow_tension, jitter, game_score = features
        
        # Weighted combination of features
        stress = (
            jaw_clench * 30 +
            (1.0 - eye_openness) * 25 +
            brow_tension * 20 +
            blink_rate * 15 +
            jitter * 10 +
            (1.0 - game_score) * 10
        )
        
        return min(100, max(0, stress))
    
    def reset_buffer(self):
        """Reset the sequence buffer for a new session"""
        self.sequence_buffer = []

# Global instance
inference_service = InferenceService()
