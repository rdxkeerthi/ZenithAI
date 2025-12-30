"""
Real-time Stress Predictor
Combines MediaPipe features with LSTM model for real-time stress analysis
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
import pickle
import cv2
from collections import deque
from typing import Dict, Optional
import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from feature_extraction.mediapipe_face import MediaPipeFaceExtractor

class StressPredictor:
    """Real-time stress prediction from facial features"""
    
    def __init__(self, model_path: str, scaler_path: str, sequence_length: int = 30):
        """
        Initialize stress predictor
        
        Args:
            model_path: Path to trained LSTM model
            scaler_path: Path to fitted scaler
            sequence_length: Number of frames for temporal analysis
        """
        self.sequence_length = sequence_length
        self.n_landmarks = 468
        self.n_features = self.n_landmarks * 3
        
        # Load model and scaler
        print(f"Loading model from {model_path}...")
        self.model = keras.models.load_model(model_path)
        
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        
        # Initialize MediaPipe
        self.face_extractor = MediaPipeFaceExtractor()
        
        # Buffer for temporal sequences
        self.landmark_buffer = deque(maxlen=sequence_length)
        self.feature_buffer = deque(maxlen=sequence_length)
        
        # Stress level mapping
        self.stress_labels = {
            0: 'Low',
            1: 'Medium',
            2: 'High'
        }
        
        print("✅ Stress predictor initialized")
    
    def predict_from_frame(self, frame: np.ndarray) -> Dict:
        """
        Predict stress from camera frame
        
        Args:
            frame: BGR image from camera
            
        Returns:
            result: Dictionary with stress prediction
        """
        # Extract landmarks
        landmarks = self.face_extractor.extract_landmarks(frame)
        
        if landmarks is None:
            return {
                'stress_level': 'Unknown',
                'stress_score': 0,
                'confidence': 0.0,
                'face_detected': False
            }
        
        # Extract micro-expressions
        micro_features = self.face_extractor.extract_micro_expressions(landmarks)
        
        # Flatten landmarks
        landmarks_flat = landmarks.flatten()
        
        # Add to buffer
        self.landmark_buffer.append(landmarks_flat)
        self.feature_buffer.append(micro_features)
        
        # Need full sequence for prediction
        if len(self.landmark_buffer) < self.sequence_length:
            return {
                'stress_level': 'Initializing',
                'stress_score': 0,
                'confidence': 0.0,
                'face_detected': True,
                'buffer_progress': len(self.landmark_buffer) / self.sequence_length,
                'micro_features': micro_features
            }
        
        # Prepare sequence
        sequence = np.array(list(self.landmark_buffer))
        
        # Normalize
        sequence_flat = sequence.reshape(-1, self.n_features)
        sequence_scaled = self.scaler.transform(sequence_flat)
        sequence = sequence_scaled.reshape(1, self.sequence_length, self.n_features)
        
        # Predict
        predictions = self.model.predict(sequence, verbose=0)[0]
        stress_class = np.argmax(predictions)
        confidence = predictions[stress_class]
        
        # Calculate stress score (0-100)
        stress_score = self._calculate_stress_score(predictions, micro_features)
        
        return {
            'stress_level': self.stress_labels[stress_class],
            'stress_score': int(stress_score),
            'confidence': float(confidence),
            'probabilities': predictions.tolist(),
            'face_detected': True,
            'stress_class': int(stress_class),
            'micro_features': micro_features
        }
    
    def _calculate_stress_score(self, predictions: np.ndarray, micro_features: Dict) -> float:
        """
        Calculate stress score (0-100) from predictions and micro-features
        
        Args:
            predictions: Model predictions [low, medium, high]
            micro_features: Extracted micro-expression features
            
        Returns:
            score: Stress score 0-100
        """
        # Base score from model predictions
        base_score = predictions[0] * 0 + predictions[1] * 50 + predictions[2] * 100
        
        # Adjust based on micro-features
        if micro_features:
            # Brow tension increases stress
            if 'brow_furrow' in micro_features:
                base_score += micro_features['brow_furrow'] * 10
            
            # Eye strain increases stress
            if 'left_eye_openness' in micro_features and 'right_eye_openness' in micro_features:
                eye_strain = 2 - (micro_features['left_eye_openness'] + micro_features['right_eye_openness'])
                base_score += eye_strain * 5
            
            # Jaw tension increases stress
            if 'jaw_tension' in micro_features:
                base_score += micro_features['jaw_tension'] * 5
        
        # Clamp to 0-100
        return max(0, min(100, base_score))
    
    def reset_buffer(self):
        """Reset temporal buffer"""
        self.landmark_buffer.clear()
        self.feature_buffer.clear()
