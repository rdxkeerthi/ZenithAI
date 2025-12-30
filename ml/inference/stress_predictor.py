"""
Real-time Stress Prediction from Facial Landmarks
Uses trained LSTM model for inference
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
import pickle
import cv2
import mediapipe as mp
from collections import deque

class StressPredictor:
    def __init__(self, model_path='../trained/stress_classifier.h5',
                 scaler_path='../trained/scaler.pkl',
                 sequence_length=30):
        """
        Initialize stress predictor
        
        Args:
            model_path: Path to trained model
            scaler_path: Path to fitted scaler
            sequence_length: Number of frames for temporal analysis
        """
        self.sequence_length = sequence_length
        self.n_landmarks = 468
        self.n_features = self.n_landmarks * 3
        
        # Load model and scaler
        print("Loading stress classification model...")
        self.model = keras.models.load_model(model_path)
        
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Buffer for temporal sequences
        self.landmark_buffer = deque(maxlen=sequence_length)
        
        # Stress level mapping
        self.stress_labels = {
            0: 'Low',
            1: 'Medium',
            2: 'High'
        }
        
    def extract_landmarks(self, frame):
        """
        Extract facial landmarks from frame using MediaPipe
        
        Args:
            frame: BGR image from camera
            
        Returns:
            landmarks: Flattened array of landmark coordinates (x, y, z)
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
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            return np.array(landmarks)
        
        return None
    
    def predict_stress(self, frame):
        """
        Predict stress level from current frame
        
        Args:
            frame: BGR image from camera
            
        Returns:
            dict: Prediction results with stress level and confidence
        """
        # Extract landmarks
        landmarks = self.extract_landmarks(frame)
        
        if landmarks is None:
            return {
                'stress_level': 'Unknown',
                'confidence': 0.0,
                'probabilities': [0.0, 0.0, 0.0],
                'face_detected': False
            }
        
        # Add to buffer
        self.landmark_buffer.append(landmarks)
        
        # Need full sequence for prediction
        if len(self.landmark_buffer) < self.sequence_length:
            return {
                'stress_level': 'Initializing',
                'confidence': 0.0,
                'probabilities': [0.0, 0.0, 0.0],
                'face_detected': True,
                'buffer_progress': len(self.landmark_buffer) / self.sequence_length
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
        
        return {
            'stress_level': self.stress_labels[stress_class],
            'confidence': float(confidence),
            'probabilities': predictions.tolist(),
            'face_detected': True,
            'stress_class': int(stress_class)
        }
    
    def get_stress_indicators(self, landmarks):
        """
        Extract specific stress indicators from facial landmarks
        
        Returns:
            dict: Stress indicators (brow tension, eye strain, etc.)
        """
        if landmarks is None or len(landmarks) < self.n_features:
            return {}
        
        # Reshape to (n_landmarks, 3)
        points = landmarks.reshape(-1, 3)
        
        # Calculate stress indicators
        # Brow furrow (distance between eyebrows)
        left_brow = points[70:110]
        right_brow = points[300:340]
        brow_distance = np.mean(np.abs(left_brow[:, 1] - right_brow[:, 1]))
        
        # Eye openness
        left_eye = points[33:133]
        right_eye = points[362:398]
        eye_openness = (np.std(left_eye[:, 1]) + np.std(right_eye[:, 1])) / 2
        
        # Mouth tension
        mouth = points[0:17]
        mouth_tension = np.std(mouth[:, :2])
        
        return {
            'brow_tension': float(brow_distance),
            'eye_strain': float(1.0 - eye_openness),
            'mouth_tension': float(mouth_tension)
        }

def test_predictor():
    """Test the stress predictor with webcam"""
    print("Testing Stress Predictor...")
    print("Press 'q' to quit")
    
    predictor = StressPredictor()
    cap = cv2.VideoCapture(0)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Predict stress
        result = predictor.predict_stress(frame)
        
        # Display results
        if result['face_detected']:
            text = f"Stress: {result['stress_level']} ({result['confidence']:.2f})"
            cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                       1, (0, 255, 0), 2)
        else:
            cv2.putText(frame, "No face detected", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        cv2.imshow('Stress Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    test_predictor()
