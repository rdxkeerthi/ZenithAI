"""
PDF Report Generator
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from datetime import datetime
import os

def generate_pdf_report(session):
    """Generate PDF stress report"""
    
    # Create reports directory
    os.makedirs("reports/generated", exist_ok=True)
    
    filename = f"reports/generated/stress_report_{session.session_id}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    
    # Container for elements
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("<b>StressGuardAI - Stress Analysis Report</b>", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))
    
    # Session info
    info_data = [
        ["Session ID:", session.session_id],
        ["Date:", session.started_at.strftime("%Y-%m-%d %H:%M")],
        ["Stress Level:", session.stress_level or "N/A"],
        ["Average Score:", f"{session.average_stress_score or 0:.1f}/100"],
        ["User:", session.user.name],
        ["Job Role:", session.user.job_role or "N/A"],
        ["Work Schedule:", f"{session.user.work_hours or 0}h/day ({session.user.work_type or 'N/A'})"],
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Recommendations
    from backend.utils.recommendation_engine import generate_recommendations
    
    user_profile = {
        'work_hours': session.user.work_hours,
        'sleep_hours': session.user.sleep_hours,
        'electronics_usage': session.user.electronics_usage
    }
    
    recommendations = generate_recommendations(session.average_stress_score or 50, user_profile)
    
    elements.append(Paragraph("<b>AI-Powered Recommendations</b>", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    for category, items in recommendations.items():
        elements.append(Paragraph(f"<b>{category.replace('_', ' ').title()}</b>", styles['Heading3']))
        for item in items[:3]:  # Top 3 recommendations
            elements.append(Paragraph(f"• {item}", styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
    
    # Build PDF
    doc.build(elements)
    
    return filename
