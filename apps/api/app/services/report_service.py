import json
from typing import Dict, List
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io

class ReportService:
    """Service for generating AI-powered stress reports"""
    
    def generate_recommendations(self, user_data: Dict, session_data: Dict, stress_analysis: Dict) -> Dict:
        """
        Generate personalized AI recommendations based on user profile and stress data
        """
        overall_stress = stress_analysis.get('overall_stress', 50)
        stress_level = stress_analysis.get('stress_level', 'Medium')
        stress_trend = stress_analysis.get('stress_trend', 'Stable')
        
        # User profile
        work_type = user_data.get('work_type', 'Unknown')
        working_hours = user_data.get('working_hours', 8)
        mobile_usage = user_data.get('mobile_usage', 4)
        
        recommendations = {
            'overall_stress': overall_stress,
            'stress_level': stress_level,
            'stress_trend': stress_trend,
            'activities': self._generate_activities(overall_stress, work_type),
            'workouts': self._generate_workouts(overall_stress, stress_trend),
            'meditation': self._generate_meditation(overall_stress),
            'food_control': self._generate_food_recommendations(overall_stress),
            'medical_checkup': self._generate_medical_advice(overall_stress, stress_level)
        }
        
        return recommendations
    
    def _generate_activities(self, stress_level: float, work_type: str) -> str:
        """Generate activity recommendations"""
        activities = []
        
        if stress_level > 70:
            activities.extend([
                "🌳 Take regular breaks every 30 minutes - walk outside for 5-10 minutes",
                "🎨 Engage in creative hobbies (painting, music, crafts) for 30 minutes daily",
                "👥 Schedule social activities with friends/family at least 3 times per week",
                "📚 Read fiction or non-work-related books for 20 minutes before bed",
                "🎮 Play relaxing games or puzzles to unwind (avoid competitive games)"
            ])
        elif stress_level > 40:
            activities.extend([
                "🚶 Take short walks during lunch breaks",
                "🎵 Listen to calming music during work",
                "🌿 Spend time in nature on weekends",
                "🎯 Pursue a hobby you enjoy for 1-2 hours weekly",
                "☕ Have regular coffee/tea breaks with colleagues"
            ])
        else:
            activities.extend([
                "✅ Maintain your current healthy work-life balance",
                "🎉 Continue engaging in activities you enjoy",
                "🤝 Keep up social connections",
                "📅 Plan regular leisure activities"
            ])
        
        return json.dumps(activities)
    
    def _generate_workouts(self, stress_level: float, trend: str) -> str:
        """Generate workout recommendations"""
        workouts = []
        
        if stress_level > 70:
            workouts.extend([
                "🧘 Yoga (30 minutes daily) - Focus on restorative poses",
                "🏃 Light jogging or brisk walking (20-30 minutes, 4-5 times/week)",
                "🏊 Swimming (2-3 times/week) - Excellent for stress relief",
                "🚴 Cycling (30 minutes, 3-4 times/week)",
                "💪 Light strength training (2 times/week) - Avoid overexertion",
                "🤸 Stretching exercises (10 minutes daily)"
            ])
        elif stress_level > 40:
            workouts.extend([
                "🏃 Moderate cardio (30 minutes, 3-4 times/week)",
                "🧘 Yoga or Pilates (2-3 times/week)",
                "💪 Strength training (2-3 times/week)",
                "🚶 Daily walks (15-20 minutes)"
            ])
        else:
            workouts.extend([
                "✅ Continue your current exercise routine",
                "🏃 Maintain 150 minutes of moderate activity per week",
                "💪 Include strength training 2 times/week"
            ])
        
        return json.dumps(workouts)
    
    def _generate_meditation(self, stress_level: float) -> str:
        """Generate meditation and mindfulness recommendations"""
        meditation = []
        
        if stress_level > 70:
            meditation.extend([
                "🧘 Practice deep breathing exercises 3 times daily (5 minutes each)",
                "🎧 Guided meditation sessions (15-20 minutes daily) - Try apps like Headspace or Calm",
                "🌅 Morning mindfulness routine (10 minutes upon waking)",
                "🌙 Evening relaxation meditation before bed (10-15 minutes)",
                "📿 Body scan meditation (20 minutes, 3 times/week)",
                "🙏 Progressive muscle relaxation (15 minutes daily)"
            ])
        elif stress_level > 40:
            meditation.extend([
                "🧘 Daily meditation practice (10 minutes)",
                "🎧 Guided breathing exercises (5 minutes, 2 times/day)",
                "🌅 Morning mindfulness (5 minutes)",
                "📱 Use meditation apps for consistency"
            ])
        else:
            meditation.extend([
                "🧘 Continue occasional meditation practice",
                "🎧 5-minute breathing exercises when needed",
                "✅ Maintain mindfulness in daily activities"
            ])
        
        return json.dumps(meditation)
    
    def _generate_food_recommendations(self, stress_level: float) -> str:
        """Generate nutrition and diet recommendations"""
        food = []
        
        if stress_level > 70:
            food.extend([
                "🥗 Increase intake of leafy greens and vegetables (5+ servings daily)",
                "🐟 Omega-3 rich foods (salmon, walnuts, flaxseeds) - 3 times/week",
                "🫐 Antioxidant-rich berries (blueberries, strawberries) - Daily",
                "🥜 Magnesium-rich foods (nuts, seeds, dark chocolate) - Moderate amounts",
                "🍵 Herbal teas (chamomile, green tea) - 2-3 cups daily",
                "💧 Hydration - Drink 8-10 glasses of water daily",
                "❌ AVOID: Excessive caffeine (limit to 1-2 cups/day)",
                "❌ AVOID: Processed foods and high sugar items",
                "❌ AVOID: Alcohol consumption"
            ])
        elif stress_level > 40:
            food.extend([
                "🥗 Balanced diet with plenty of vegetables",
                "🐟 Include omega-3 sources weekly",
                "💧 Stay well hydrated (8 glasses/day)",
                "☕ Moderate caffeine intake",
                "🍎 Healthy snacks (fruits, nuts)"
            ])
        else:
            food.extend([
                "✅ Maintain your current healthy diet",
                "🥗 Continue eating balanced meals",
                "💧 Keep up good hydration habits"
            ])
        
        return json.dumps(food)
    
    def _generate_medical_advice(self, stress_level: float, level_category: str) -> str:
        """Generate medical checkup recommendations"""
        medical = []
        
        if stress_level > 70:
            medical.extend([
                "⚠️ RECOMMENDED: Schedule a consultation with your primary care physician within 2 weeks",
                "🧠 Consider consulting a mental health professional (therapist or counselor)",
                "💊 Discuss stress management strategies with your doctor",
                "📊 Get comprehensive health screening (blood pressure, cortisol levels, etc.)",
                "😴 If experiencing sleep issues, consult a sleep specialist",
                "💚 Regular check-ins with healthcare provider (monthly for 3 months)"
            ])
        elif stress_level > 40:
            medical.extend([
                "📅 Schedule routine health checkup within 1-2 months",
                "💬 Discuss stress levels with your doctor during next visit",
                "📊 Monitor blood pressure regularly",
                "😴 Track sleep quality and discuss if issues persist"
            ])
        else:
            medical.extend([
                "✅ Continue annual health checkups",
                "📅 Maintain regular preventive care schedule",
                "💬 Mention stress management during routine visits"
            ])
        
        return json.dumps(medical)
    
    def generate_pdf_report(self, user_data: Dict, session_data: Dict, recommendations: Dict) -> bytes:
        """Generate PDF report"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a237e'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#283593'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("AI Stress Analysis Report", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # User Info
        story.append(Paragraph("Personal Information", heading_style))
        user_info = [
            ['Name:', user_data.get('name', 'N/A')],
            ['Email:', user_data.get('email', 'N/A')],
            ['Work Type:', user_data.get('work_type', 'N/A')],
            ['Working Hours:', f"{user_data.get('working_hours', 'N/A')} hours/day"],
            ['Mobile Usage:', f"{user_data.get('mobile_usage', 'N/A')} hours/day"],
        ]
        user_table = Table(user_info, colWidths=[2*inch, 4*inch])
        user_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8eaf6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(user_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Stress Analysis
        story.append(Paragraph("Stress Analysis Summary", heading_style))
        stress_color = colors.green
        if recommendations['overall_stress'] > 70:
            stress_color = colors.red
        elif recommendations['overall_stress'] > 40:
            stress_color = colors.orange
        
        stress_info = [
            ['Overall Stress Score:', f"{recommendations['overall_stress']:.1f}/100"],
            ['Stress Level:', recommendations['stress_level']],
            ['Trend:', recommendations['stress_trend']],
            ['Report Date:', datetime.now().strftime('%Y-%m-%d %H:%M')]
        ]
        stress_table = Table(stress_info, colWidths=[2*inch, 4*inch])
        stress_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8eaf6')),
            ('BACKGROUND', (1, 0), (1, 0), stress_color),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('TEXTCOLOR', (1, 0), (1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(stress_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Recommendations sections
        sections = [
            ('Recommended Activities', 'activities'),
            ('Workout Plan', 'workouts'),
            ('Meditation & Mindfulness', 'meditation'),
            ('Nutrition Guidelines', 'food_control'),
            ('Medical Recommendations', 'medical_checkup')
        ]
        
        for section_title, key in sections:
            story.append(Paragraph(section_title, heading_style))
            items = json.loads(recommendations[key])
            for item in items:
                story.append(Paragraph(f"• {item}", styles['Normal']))
                story.append(Spacer(1, 0.05*inch))
            story.append(Spacer(1, 0.2*inch))
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_text = "This report is generated by AI and should not replace professional medical advice. Please consult healthcare professionals for personalized guidance."
        story.append(Paragraph(footer_text, styles['Italic']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

# Global instance
report_service = ReportService()
