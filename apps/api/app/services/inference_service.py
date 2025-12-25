"""
Enhanced Inference Service with Detailed Stress Analysis

Features:
- 20+ facial metrics processing
- User data integration
- Comprehensive stress assessment
- Real-time analysis
"""

import torch
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
import logging

# DO NOT import EnhancedStressLSTM - causes initialization errors
# from app.ml.model import EnhancedStressLSTM

logger = logging.getLogger(__name__)


class EnhancedInferenceService:
    """Advanced stress inference with detailed metrics"""
    
    def __init__(self, model_path: str = "models/stress_lstm_enhanced.pth"):
        self.model = None
        self.model_path = model_path
        self.sequence_length = 30
        self.feature_buffer: List[np.ndarray] = []
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Use heuristic-only mode for now to avoid initialization errors
        self.use_model = False
        logger.info("Enhanced inference service initialized (heuristic mode)")
    
    def load_model(self):
        """Load the enhanced LSTM model - currently disabled"""
        # Temporarily disabled to avoid initialization errors
        # Will use heuristic predictions instead
        logger.info("Using heuristic-based predictions (model loading disabled)")
        pass
    
    def extract_features(self, metrics: Dict) -> np.ndarray:
        """
        Extract feature vector from detailed metrics
        
        Args:
            metrics: Dictionary containing detailed facial metrics
            
        Returns:
            Feature vector (24 dimensions)
        """
        features = np.array([
            # Eye metrics (6)
            metrics.get('blinkRate', 15) / 30.0,  # Normalize to 0-1
            metrics.get('leftEyeOpenness', 0.3),
            metrics.get('rightEyeOpenness', 0.3),
            metrics.get('eyeAsymmetry', 0.0),
            metrics.get('pupilDilation', 0.3),
            
            # Facial tension (4)
            metrics.get('browTension', 0.0),
            metrics.get('jawTension', 0.0),
            metrics.get('lipTension', 0.0),
            metrics.get('cheekTension', 0.0),
            
            # Micro-expressions (3)
            metrics.get('microSmile', 0.0),
            metrics.get('microFrown', 0.0),
            metrics.get('microSurprise', 0.0),
            
            # Head pose (4)
            metrics.get('headYaw', 0.0) / 100.0,  # Normalize
            metrics.get('headPitch', 0.0) / 100.0,
            metrics.get('headRoll', 0.0) / 180.0,
            metrics.get('headStability', 0.0) / 20.0,
            
            # Advanced metrics (3)
            metrics.get('facialSymmetry', 1.0),
            metrics.get('skinTone', 0.5),
            metrics.get('breathingRate', 16) / 30.0,
            
            # Game performance (4)
            metrics.get('gameClicks', 0) / 100.0,
            metrics.get('gameAccuracy', 0.0),
            metrics.get('gameReaction', 0) / 2000.0,
            metrics.get('gameMistakes', 0) / 20.0,
        ], dtype=np.float32)
        
        return features
    
    def predict(self, metrics: Dict, user_data: Optional[Dict] = None) -> Dict:
        """
        Predict stress level from metrics
        
        Args:
            metrics: Detailed facial metrics
            user_data: Optional user information for context
            
        Returns:
            Prediction dictionary with level, score, confidence
        """
        try:
            # Extract features
            features = self.extract_features(metrics)
            
            # Add to buffer
            self.feature_buffer.append(features)
            if len(self.feature_buffer) > self.sequence_length:
                self.feature_buffer.pop(0)
            
            # Use heuristic prediction (model disabled)
            return self._heuristic_prediction(metrics, user_data)
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return self._heuristic_prediction(metrics, user_data)
    
    def _heuristic_prediction(self, metrics: Dict, user_data: Optional[Dict] = None) -> Dict:
        """Fallback heuristic prediction"""
        score = 0.0
        
        # Blink rate
        blink_rate = metrics.get('blinkRate', 15)
        if blink_rate < 8:
            score += 0.3
        elif blink_rate < 12:
            score += 0.15
        elif blink_rate > 25:
            score += 0.2
        
        # Eye openness
        left_eye = metrics.get('leftEyeOpenness', 0.3)
        right_eye = metrics.get('rightEyeOpenness', 0.3)
        if left_eye < 0.2 or right_eye < 0.2:
            score += 0.25
        
        # Facial tension
        score += metrics.get('browTension', 0.0) * 0.2
        score += metrics.get('jawTension', 0.0) * 0.15
        
        # Head movement
        head_stability = metrics.get('headStability', 0.0)
        if head_stability > 10:
            score += 0.15
        
        # User context
        if user_data:
            if user_data.get('hoursWorked', 8) > 10:
                score += 0.1
            if user_data.get('sleepHours', 7) < 6:
                score += 0.1
        
        score = min(1.0, max(0.0, score))
        
        if score < 0.33:
            level = 'LOW'
        elif score < 0.66:
            level = 'MEDIUM'
        else:
            level = 'HIGH'
        
        return {
            'level': level,
            'score': score,
            'confidence': 0.7,
            'probabilities': {
                'LOW': 1 - score if score < 0.33 else 0.2,
                'MEDIUM': score if 0.33 <= score < 0.66 else 0.3,
                'HIGH': score if score >= 0.66 else 0.1
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def _adjust_for_user_context(self, level: str, score: float, user_data: Dict) -> tuple:
        """Adjust prediction based on user context"""
        adjustment = 0.0
        
        # Work hours
        hours_worked = user_data.get('hoursWorked', 8)
        if hours_worked > 12:
            adjustment += 0.15
        elif hours_worked > 10:
            adjustment += 0.1
        
        # Sleep
        sleep_hours = user_data.get('sleepHours', 7)
        if sleep_hours < 5:
            adjustment += 0.15
        elif sleep_hours < 6:
            adjustment += 0.1
        
        # Shift type
        if user_data.get('shiftType') == 'night':
            adjustment += 0.05
        
        # Stress history
        stress_history = user_data.get('stressHistory', 'moderate')
        if stress_history == 'severe':
            adjustment += 0.1
        elif stress_history == 'moderate':
            adjustment += 0.05
        
        # Apply adjustment
        new_score = min(1.0, score + adjustment)
        
        # Re-classify if needed
        if new_score < 0.33:
            new_level = 'LOW'
        elif new_score < 0.66:
            new_level = 'MEDIUM'
        else:
            new_level = 'HIGH'
        
        return new_level, new_score
    
    def reset(self):
        """Reset the feature buffer"""
        self.feature_buffer = []
        logger.info("Feature buffer reset")


# Singleton instance
_inference_service: Optional[EnhancedInferenceService] = None


def get_inference_service() -> EnhancedInferenceService:
    """Get or create the inference service singleton"""
    global _inference_service
    if _inference_service is None:
        _inference_service = EnhancedInferenceService()
    return _inference_service
