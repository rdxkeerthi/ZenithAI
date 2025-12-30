"""
MediaPipe Face Feature Extraction
Extracts facial landmarks and micro-expressions
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Optional, Tuple

class MediaPipeFaceExtractor:
    """Extract facial features using MediaPipe"""
    
    def __init__(self):
        """Initialize MediaPipe Face Mesh"""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
    def extract_landmarks(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract 468 facial landmarks from frame
        
        Args:
            frame: BGR image from camera
            
        Returns:
            landmarks: Array of shape (468, 3) with x, y, z coordinates
        """
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame
        results = self.face_mesh.process(rgb_frame)
        
        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0]
            
            # Extract coordinates
            landmarks = []
            for landmark in face_landmarks.landmark:
                landmarks.append([landmark.x, landmark.y, landmark.z])
            
            return np.array(landmarks)
        
        return None
    
    def extract_micro_expressions(self, landmarks: np.ndarray) -> Dict[str, float]:
        """
        Extract micro-expression features from landmarks
        
        Args:
            landmarks: Facial landmarks array (468, 3)
            
        Returns:
            features: Dictionary of micro-expression features
        """
        if landmarks is None or len(landmarks) < 468:
            return {}
        
        features = {}
        
        # Eye blink detection
        features['left_eye_openness'] = self._calculate_eye_openness(landmarks, 'left')
        features['right_eye_openness'] = self._calculate_eye_openness(landmarks, 'right')
        
        # Eyebrow tension
        features['left_brow_height'] = self._calculate_brow_height(landmarks, 'left')
        features['right_brow_height'] = self._calculate_brow_height(landmarks, 'right')
        features['brow_furrow'] = self._calculate_brow_furrow(landmarks)
        
        # Mouth features
        features['mouth_openness'] = self._calculate_mouth_openness(landmarks)
        features['lip_compression'] = self._calculate_lip_compression(landmarks)
        
        # Jaw tension
        features['jaw_tension'] = self._calculate_jaw_tension(landmarks)
        
        # Head pose
        features['head_pitch'], features['head_yaw'], features['head_roll'] = self._estimate_head_pose(landmarks)
        
        return features
    
    def _calculate_eye_openness(self, landmarks: np.ndarray, eye: str) -> float:
        """Calculate eye openness (0=closed, 1=open)"""
        if eye == 'left':
            # Left eye landmarks
            upper = landmarks[159]
            lower = landmarks[145]
        else:
            # Right eye landmarks
            upper = landmarks[386]
            lower = landmarks[374]
        
        distance = np.linalg.norm(upper - lower)
        return float(distance)
    
    def _calculate_brow_height(self, landmarks: np.ndarray, side: str) -> float:
        """Calculate eyebrow height"""
        if side == 'left':
            brow = landmarks[70]
            eye = landmarks[159]
        else:
            brow = landmarks[300]
            eye = landmarks[386]
        
        height = brow[1] - eye[1]
        return float(height)
    
    def _calculate_brow_furrow(self, landmarks: np.ndarray) -> float:
        """Calculate brow furrow intensity"""
        left_brow = landmarks[70]
        right_brow = landmarks[300]
        
        distance = np.linalg.norm(left_brow - right_brow)
        return float(distance)
    
    def _calculate_mouth_openness(self, landmarks: np.ndarray) -> float:
        """Calculate mouth openness"""
        upper_lip = landmarks[13]
        lower_lip = landmarks[14]
        
        distance = np.linalg.norm(upper_lip - lower_lip)
        return float(distance)
    
    def _calculate_lip_compression(self, landmarks: np.ndarray) -> float:
        """Calculate lip compression"""
        left_corner = landmarks[61]
        right_corner = landmarks[291]
        
        width = np.linalg.norm(left_corner - right_corner)
        return float(width)
    
    def _calculate_jaw_tension(self, landmarks: np.ndarray) -> float:
        """Calculate jaw tension"""
        jaw_left = landmarks[172]
        jaw_right = landmarks[397]
        
        distance = np.linalg.norm(jaw_left - jaw_right)
        return float(distance)
    
    def _estimate_head_pose(self, landmarks: np.ndarray) -> Tuple[float, float, float]:
        """Estimate head pose (pitch, yaw, roll)"""
        # Simplified head pose estimation
        nose = landmarks[1]
        left_eye = landmarks[33]
        right_eye = landmarks[263]
        
        # Calculate angles (simplified)
        pitch = float(nose[1] - (left_eye[1] + right_eye[1]) / 2)
        yaw = float(nose[0] - (left_eye[0] + right_eye[0]) / 2)
        roll = float(np.arctan2(right_eye[1] - left_eye[1], right_eye[0] - left_eye[0]))
        
        return pitch, yaw, roll
    
    def draw_landmarks(self, frame: np.ndarray, landmarks: np.ndarray) -> np.ndarray:
        """Draw landmarks on frame for visualization"""
        annotated_frame = frame.copy()
        
        h, w = frame.shape[:2]
        
        for landmark in landmarks:
            x = int(landmark[0] * w)
            y = int(landmark[1] * h)
            cv2.circle(annotated_frame, (x, y), 1, (0, 255, 0), -1)
        
        return annotated_frame
