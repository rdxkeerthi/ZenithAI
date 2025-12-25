"""
RAG-based AI Assistant for Stress Reduction

Uses Retrieval-Augmented Generation to provide:
- Context-aware stress reduction recommendations
- Evidence-based health guidance
- Personalized interventions

Architecture:
- Vector DB (Qdrant) for knowledge retrieval
- OpenAI/Anthropic LLM for generation
- Curated health knowledge base
"""

from typing import List, Dict, Optional
import numpy as np
from pathlib import Path
import json


class StressAssistant:
    """
    AI Assistant for stress reduction guidance.
    
    This is a simplified version. Production would use:
    - Qdrant/Pinecone for vector storage
    - OpenAI GPT-4 or Anthropic Claude for LLM
    - Embeddings model (text-embedding-ada-002)
    """
    
    def __init__(self, knowledge_base_path: str = None):
        self.knowledge_base = self._load_knowledge_base(knowledge_base_path)
        
    def _load_knowledge_base(self, path: Optional[str]) -> List[Dict]:
        """Load curated health interventions."""
        # In production, this would be a vector database
        # For now, use a simple in-memory knowledge base
        
        return [
            {
                "id": "breathing_box",
                "category": "breathing",
                "title": "Box Breathing Exercise",
                "description": "4-4-4-4 breathing pattern for rapid stress reduction",
                "instructions": [
                    "Inhale slowly through your nose for 4 seconds",
                    "Hold your breath for 4 seconds",
                    "Exhale slowly through your mouth for 4 seconds",
                    "Hold empty lungs for 4 seconds",
                    "Repeat 4-5 cycles"
                ],
                "duration": "2 minutes",
                "effectiveness": "high",
                "triggers": ["high_stress", "anxiety", "rapid_heartbeat"]
            },
            {
                "id": "breathing_478",
                "category": "breathing",
                "title": "4-7-8 Breathing Technique",
                "description": "Calming breath pattern for relaxation",
                "instructions": [
                    "Inhale through nose for 4 seconds",
                    "Hold breath for 7 seconds",
                    "Exhale through mouth for 8 seconds",
                    "Repeat 3-4 cycles"
                ],
                "duration": "1-2 minutes",
                "effectiveness": "high",
                "triggers": ["medium_stress", "sleep_difficulty", "tension"]
            },
            {
                "id": "micro_break",
                "category": "movement",
                "title": "Micro-Break Protocol",
                "description": "Short movement break to reset focus",
                "instructions": [
                    "Stand up and stretch arms overhead",
                    "Roll shoulders backward 5 times",
                    "Gentle neck rotations (3 each direction)",
                    "Walk for 30 seconds",
                    "Return to work refreshed"
                ],
                "duration": "2 minutes",
                "effectiveness": "medium",
                "triggers": ["prolonged_sitting", "eye_strain", "posture_issues"]
            },
            {
                "id": "eye_rest",
                "category": "vision",
                "title": "20-20-20 Eye Rest Rule",
                "description": "Reduce digital eye strain",
                "instructions": [
                    "Every 20 minutes, look away from screen",
                    "Focus on object 20 feet away",
                    "Hold gaze for 20 seconds",
                    "Blink deliberately 10 times",
                    "Resume work"
                ],
                "duration": "20 seconds",
                "effectiveness": "medium",
                "triggers": ["low_blink_rate", "eye_strain", "screen_time"]
            },
            {
                "id": "progressive_relaxation",
                "category": "relaxation",
                "title": "Quick Progressive Muscle Relaxation",
                "description": "Release physical tension systematically",
                "instructions": [
                    "Tense shoulders for 5 seconds, then release",
                    "Clench fists for 5 seconds, then release",
                    "Tighten jaw for 5 seconds, then release",
                    "Notice the difference between tension and relaxation",
                    "Take 3 deep breaths"
                ],
                "duration": "3 minutes",
                "effectiveness": "high",
                "triggers": ["muscle_tension", "high_stress", "physical_discomfort"]
            },
            {
                "id": "hydration_reminder",
                "category": "wellness",
                "title": "Hydration Check",
                "description": "Maintain cognitive function through hydration",
                "instructions": [
                    "Drink a full glass of water (8oz)",
                    "Notice how you feel",
                    "Set timer for next hydration check (2 hours)"
                ],
                "duration": "1 minute",
                "effectiveness": "low",
                "triggers": ["fatigue", "headache", "prolonged_work"]
            }
        ]
    
    def get_recommendation(
        self, 
        stress_level: float,
        context: Dict[str, any]
    ) -> Dict:
        """
        Get personalized stress reduction recommendation.
        
        Args:
            stress_level: Current stress (0-1)
            context: Additional context (e.g., blink_rate, duration, etc.)
            
        Returns:
            Recommendation dict with intervention and explanation
        """
        # Determine triggers based on context
        triggers = []
        
        if stress_level > 0.7:
            triggers.append("high_stress")
        elif stress_level > 0.4:
            triggers.append("medium_stress")
        
        if context.get("blink_rate", 15) < 10:
            triggers.append("low_blink_rate")
            triggers.append("eye_strain")
        
        if context.get("session_duration", 0) > 30:
            triggers.append("prolonged_work")
            triggers.append("prolonged_sitting")
        
        # Find matching interventions
        matching = []
        for intervention in self.knowledge_base:
            overlap = set(triggers) & set(intervention["triggers"])
            if overlap:
                score = len(overlap) / len(intervention["triggers"])
                matching.append((score, intervention))
        
        # Sort by relevance
        matching.sort(reverse=True, key=lambda x: x[0])
        
        if matching:
            best_intervention = matching[0][1]
        else:
            # Default fallback
            best_intervention = self.knowledge_base[0]
        
        # Generate personalized message
        message = self._generate_message(stress_level, best_intervention, context)
        
        return {
            "intervention": best_intervention,
            "message": message,
            "confidence": matching[0][0] if matching else 0.5
        }
    
    def _generate_message(
        self, 
        stress_level: float, 
        intervention: Dict,
        context: Dict
    ) -> str:
        """Generate personalized, empathetic message."""
        
        # Greeting based on stress level
        if stress_level > 0.7:
            greeting = "I notice your stress levels are elevated."
        elif stress_level > 0.4:
            greeting = "Your stress levels are moderate."
        else:
            greeting = "You're doing well!"
        
        # Context-aware observation
        observations = []
        if context.get("blink_rate", 15) < 10:
            observations.append("Your blink rate suggests eye fatigue")
        if context.get("session_duration", 0) > 30:
            observations.append("You've been working for a while")
        
        observation_text = ". ".join(observations) + "." if observations else ""
        
        # Recommendation
        recommendation = f"I recommend trying: **{intervention['title']}**"
        
        # Full message
        message = f"{greeting} {observation_text}\n\n{recommendation}\n\n*{intervention['description']}*\n\nThis will take about {intervention['duration']}."
        
        return message


# Singleton instance
_assistant = None

def get_assistant() -> StressAssistant:
    """Get or create assistant instance."""
    global _assistant
    if _assistant is None:
        _assistant = StressAssistant()
    return _assistant


if __name__ == "__main__":
    # Test assistant
    assistant = StressAssistant()
    
    # High stress scenario
    rec = assistant.get_recommendation(
        stress_level=0.85,
        context={"blink_rate": 8, "session_duration": 45}
    )
    
    print("=== High Stress Recommendation ===")
    print(rec["message"])
    print(f"\nConfidence: {rec['confidence']:.2f}")
    print(f"\nInstructions:")
    for i, step in enumerate(rec["intervention"]["instructions"], 1):
        print(f"{i}. {step}")
