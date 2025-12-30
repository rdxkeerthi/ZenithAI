"""
Stress score calculation utilities
"""

def calculate_stress_score(predictions, micro_features=None):
    """Calculate stress score from predictions and features"""
    
    # Base score from model
    score = predictions[0] * 0 + predictions[1] * 50 + predictions[2] * 100
    
    return min(100, max(0, score))

def get_stress_level(score):
    """Get stress level from score"""
    if score < 33:
        return "Low"
    elif score < 66:
        return "Medium"
    else:
        return "High"
