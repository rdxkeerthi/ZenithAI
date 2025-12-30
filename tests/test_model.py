"""
Test ML Model Integration
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml.inference.realtime_predictor import StressPredictor
import numpy as np

def test_model_loading():
    """Test model loading"""
    print("🧪 Testing ML Model Loading...")
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'trained', 'stress_classifier.h5')
    scaler_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'trained', 'scaler.pkl')
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        print("⚠️  Please train the model first: cd ml/training && python train_stress_model.py")
        return False
    
    try:
        predictor = StressPredictor(model_path, scaler_path)
        print("✅ Model loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return False

def test_prediction():
    """Test stress prediction"""
    print("\n🧪 Testing Stress Prediction...")
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'trained', 'stress_classifier.h5')
    scaler_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'trained', 'scaler.pkl')
    
    if not os.path.exists(model_path):
        print("⚠️  Skipping prediction test (model not found)")
        return
    
    try:
        predictor = StressPredictor(model_path, scaler_path)
        
        # Create dummy frame
        dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Test prediction
        result = predictor.predict_from_frame(dummy_frame)
        
        print(f"✅ Prediction result: {result}")
        
        # Verify result structure
        assert 'stress_level' in result
        assert 'stress_score' in result
        assert 'confidence' in result
        assert 'face_detected' in result
        
        print("✅ Prediction test passed!")
        
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("StressGuardAI - ML Model Tests")
    print("=" * 60 + "\n")
    
    if test_model_loading():
        test_prediction()
    
    print("\n" + "=" * 60)
    print("Tests completed!")
    print("=" * 60)
