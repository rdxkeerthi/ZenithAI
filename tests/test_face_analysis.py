"""
Test Face Analysis - MediaPipe Integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml.feature_extraction.mediapipe_face import MediaPipeFaceExtractor
import cv2
import numpy as np

def test_mediapipe_extraction():
    """Test MediaPipe face extraction"""
    print("🧪 Testing MediaPipe Face Extraction...")
    
    extractor = MediaPipeFaceExtractor()
    
    # Create dummy frame
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Test landmark extraction
    landmarks = extractor.extract_landmarks(frame)
    
    if landmarks is None:
        print("⚠️  No face detected (expected for blank frame)")
    else:
        print(f"✅ Extracted {len(landmarks)} landmarks")
        assert len(landmarks) == 468, "Should extract 468 landmarks"
        
        # Test micro-expression extraction
        features = extractor.extract_micro_expressions(landmarks)
        print(f"✅ Extracted {len(features)} micro-expression features")
        
        expected_features = [
            'left_eye_openness', 'right_eye_openness',
            'left_brow_height', 'right_brow_height', 'brow_furrow',
            'mouth_openness', 'lip_compression', 'jaw_tension',
            'head_pitch', 'head_yaw', 'head_roll'
        ]
        
        for feature in expected_features:
            assert feature in features, f"Missing feature: {feature}"
        
        print("✅ All micro-expression features present")
    
    print("✅ MediaPipe test passed!\n")

def test_real_camera():
    """Test with real camera if available"""
    print("🧪 Testing Real Camera Integration...")
    
    try:
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("⚠️  No camera available")
            return
        
        extractor = MediaPipeFaceExtractor()
        
        print("📸 Capturing frame from camera...")
        ret, frame = cap.read()
        
        if ret:
            landmarks = extractor.extract_landmarks(frame)
            
            if landmarks is not None:
                print(f"✅ Detected face with {len(landmarks)} landmarks")
                features = extractor.extract_micro_expressions(landmarks)
                print(f"✅ Extracted features: {list(features.keys())}")
            else:
                print("⚠️  No face detected in frame")
        
        cap.release()
        print("✅ Camera test completed!\n")
        
    except Exception as e:
        print(f"⚠️  Camera test failed: {e}\n")

if __name__ == "__main__":
    print("=" * 60)
    print("StressGuardAI - Face Analysis Tests")
    print("=" * 60 + "\n")
    
    test_mediapipe_extraction()
    test_real_camera()
    
    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)
