"""
AI-powered recommendation engine
Generates personalized stress reduction recommendations
"""

import random

def generate_recommendations(stress_score: float, user_profile: dict = None) -> Dict[str, List[str]]:
    # ... (existing level logic) ...
    if stress_score < 33:
        level = "low"
    elif stress_score < 66:
        level = "medium"
    else:
        level = "high"
    
    # Get base recommendations
    medical = get_medical_recommendations(level)
    meditation = get_meditation_recommendations(level)
    work_life = get_work_life_recommendations(level)
    nutrition = get_nutrition_recommendations(level)
    screen_time = get_screen_time_recommendations(level)

    # Add randomness: Shuffle and pick top 3-4 so it feels dynamic every time
    random.shuffle(medical)
    random.shuffle(meditation)
    random.shuffle(work_life)
    random.shuffle(nutrition)
    random.shuffle(screen_time)

    recommendations = {
        "medical": medical[:4],
        "meditation": meditation[:4],
        "work_life_balance": work_life[:4],
        "nutrition": nutrition[:4],
        "screen_time": screen_time[:4]
    }

    # Personalize based on profile (Always insert these at top if relevant)
    if user_profile:
        work_hours = user_profile.get('work_hours') or 0
        sleep_hours = user_profile.get('sleep_hours') or 8
        electronics_usage = user_profile.get('electronics_usage') or 0
        
        if work_hours > 9:
            recommendations['work_life_balance'].insert(0, f"Your reported work hours ({work_hours}h) are high. Prioritize breaks.")
        
        if sleep_hours < 7:
            recommendations['medical'].insert(0, f"You are sleeping only {sleep_hours}h. Aim for 7-9 hours for recovery.")
            
        if electronics_usage > 4:
            recommendations['screen_time'].insert(0, f"High screen time reported ({electronics_usage}h). Use blue light filters.")

    return recommendations

def get_medical_recommendations(level: str) -> List[str]:
    """Medical recommendations (non-diagnostic)"""
    
    base = [
        "Monitor your overall health and well-being",
        "Maintain regular sleep schedule (7-9 hours)",
        "Stay physically active with regular exercise"
    ]
    
    if level == "medium":
        base.extend([
            "Consider consulting a healthcare professional if symptoms persist",
            "Track your stress triggers in a journal",
            "Practice regular health check-ups"
        ])
    elif level == "high":
        base.extend([
            "Strongly consider professional mental health support",
            "Monitor blood pressure and heart rate regularly",
            "Discuss stress management with your doctor",
            "Consider stress-related health screening"
        ])
    
    return base

def get_meditation_recommendations(level: str) -> List[str]:
    """Meditation and mindfulness recommendations"""
    
    base = [
        "Practice deep breathing exercises (5-10 minutes daily)",
        "Try guided meditation apps (Headspace, Calm)",
        "Focus on present moment awareness"
    ]
    
    if level == "medium":
        base.extend([
            "Increase meditation to 15-20 minutes daily",
            "Try body scan meditation before sleep",
            "Practice mindful walking during breaks"
        ])
    elif level == "high":
        base.extend([
            "Consider professional meditation instruction",
            "Practice meditation 2-3 times daily",
            "Try progressive muscle relaxation",
            "Explore yoga or tai chi classes"
        ])
    
    return base

def get_work_life_recommendations(level: str) -> List[str]:
    """Work-life balance recommendations"""
    
    base = [
        "Set clear boundaries between work and personal time",
        "Take regular breaks during work (every 90 minutes)",
        "Prioritize important tasks, delegate when possible"
    ]
    
    if level == "medium":
        base.extend([
            "Review and adjust workload with supervisor",
            "Learn to say 'no' to non-essential commitments",
            "Schedule dedicated personal/family time",
            "Take all allocated vacation days"
        ])
    elif level == "high":
        base.extend([
            "Consider discussing workload reduction with management",
            "Seek professional work-life balance coaching",
            "Evaluate career alignment with personal values",
            "Take immediate time off if possible"
        ])
    
    return base

def get_nutrition_recommendations(level: str) -> List[str]:
    """Nutrition and hydration recommendations"""
    
    base = [
        "Stay hydrated (8-10 glasses of water daily)",
        "Eat balanced meals with fruits and vegetables",
        "Limit caffeine intake (especially after 2 PM)"
    ]
    
    if level == "medium":
        base.extend([
            "Reduce sugar and processed food intake",
            "Include omega-3 rich foods (fish, nuts)",
            "Avoid skipping meals",
            "Consider magnesium-rich foods (dark leafy greens)"
        ])
    elif level == "high":
        base.extend([
            "Consult a nutritionist for personalized diet plan",
            "Eliminate or significantly reduce alcohol",
            "Consider stress-reducing supplements (consult doctor first)",
            "Maintain regular meal times"
        ])
    
    return base

def get_screen_time_recommendations(level: str) -> List[str]:
    """Screen time and digital wellness recommendations"""
    
    base = [
        "Follow 20-20-20 rule (every 20 min, look 20 feet away for 20 sec)",
        "Use blue light filters after sunset",
        "Limit screen time 1 hour before bed"
    ]
    
    if level == "medium":
        base.extend([
            "Set app time limits on phone",
            "Designate screen-free zones (bedroom, dining)",
            "Take digital detox breaks on weekends",
            "Use focus mode during work hours"
        ])
    elif level == "high":
        base.extend([
            "Implement strict screen time boundaries",
            "Consider digital wellness apps",
            "Replace screen time with physical activities",
            "Seek professional help for digital addiction if needed"
        ])
    
    return base
