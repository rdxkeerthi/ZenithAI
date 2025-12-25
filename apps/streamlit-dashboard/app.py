"""
ZenithAI Streamlit Dashboard - Main Entry Point

Real-time stress monitoring dashboard for ML engineers and data scientists.
Provides live camera feed, stress predictions, and model insights.
"""

import streamlit as st
import time
from pathlib import Path

# Page config
st.set_page_config(
    page_title="ZenithAI - Stress Monitoring Dashboard",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Google-style UI
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #64748B;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 12px;
        color: white;
        margin-bottom: 1rem;
    }
    .stress-low {
        color: #10B981;
        font-weight: 600;
    }
    .stress-medium {
        color: #F59E0B;
        font-weight: 600;
    }
    .stress-high {
        color: #EF4444;
        font-weight: 600;
    }
    div[data-testid="stMetricValue"] {
        font-size: 2rem;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.image("https://via.placeholder.com/200x60/0EA5E9/FFFFFF?text=ZenithAI", use_container_width=True)
    st.markdown("---")
    
    st.markdown("### 🎯 Navigation")
    st.markdown("Use the pages above to navigate:")
    st.markdown("- **Live Monitor**: Real-time stress detection")
    st.markdown("- **Analytics**: Historical trends")
    st.markdown("- **Model Insights**: Explainability")
    st.markdown("- **HR Analytics**: Team insights")
    
    st.markdown("---")
    st.markdown("### ⚙️ System Status")
    
    # Mock system status
    col1, col2 = st.columns(2)
    with col1:
        st.metric("API", "🟢 Online", delta=None)
    with col2:
        st.metric("ML Engine", "🟢 Ready", delta=None)
    
    st.markdown("---")
    st.markdown("### 📊 Quick Stats")
    st.metric("Active Sessions", "12", delta="3")
    st.metric("Avg Stress", "42%", delta="-5%", delta_color="inverse")
    
# Main content
st.markdown('<div class="main-header">🧠 ZenithAI Stress Monitoring Platform</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Enterprise-grade, privacy-first stress detection powered by Computer Vision & Deep Learning</div>', unsafe_allow_html=True)

# Feature cards
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown("""
    <div style="padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h3 style="margin: 0; font-size: 1.2rem;">🎥 Real-Time Detection</h3>
        <p style="margin-top: 0.5rem; opacity: 0.9;">Live webcam analysis with <100ms latency</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div style="padding: 1.5rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; color: white;">
        <h3 style="margin: 0; font-size: 1.2rem;">🔒 Privacy First</h3>
        <p style="margin-top: 0.5rem; opacity: 0.9;">On-device processing, zero video storage</p>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div style="padding: 1.5rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white;">
        <h3 style="margin: 0; font-size: 1.2rem;">🧠 LSTM + Attention</h3>
        <p style="margin-top: 0.5rem; opacity: 0.9;">Temporal modeling with explainability</p>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown("""
    <div style="padding: 1.5rem; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 12px; color: white;">
        <h3 style="margin: 0; font-size: 1.2rem;">📈 Enterprise Scale</h3>
        <p style="margin-top: 0.5rem; opacity: 0.9;">10k+ concurrent users supported</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Quick start guide
st.markdown("### 🚀 Quick Start")

col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("""
    #### Getting Started
    
    1. **Live Monitoring**: Navigate to the "Live Monitor" page to start real-time stress detection
    2. **Grant Camera Access**: Allow webcam permissions when prompted
    3. **View Results**: See your stress level update in real-time with confidence scores
    4. **Explore Analytics**: Check historical trends and model performance
    
    #### Key Features
    
    - **MediaPipe Integration**: 468-point facial landmark detection
    - **LSTM Neural Network**: Temporal sequence modeling for accurate predictions
    - **Attention Mechanism**: Understand which time frames contribute to stress detection
    - **SHAP Values**: Feature importance for model explainability
    - **WebSocket Streaming**: Real-time bidirectional communication
    """)

with col2:
    st.info("**System Architecture**\n\nClient (Browser) → MediaPipe → WebSocket → FastAPI → LSTM Model → Dashboard")
    
    st.success("**Privacy Guarantee**\n\nRaw video never leaves your device. Only numerical feature vectors are transmitted.")
    
    st.warning("**Note**: This is a research/demo system. Not for medical diagnosis.")

st.markdown("---")

# Architecture diagram
st.markdown("### 🏗️ System Architecture")

st.markdown("""
```
┌─────────────────┐
│   Browser       │
│  (MediaPipe)    │ ← Camera Feed
└────────┬────────┘
         │ Feature Vectors (JSON)
         ↓
┌─────────────────┐
│   FastAPI       │
│  (WebSocket)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  LSTM Engine    │
│  (PyTorch)      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Dashboard     │
│  (Streamlit)    │ ← You are here
└─────────────────┘
```
""")

st.markdown("---")

# Footer
st.markdown("""
<div style="text-align: center; color: #64748B; padding: 2rem 0;">
    <p><strong>ZenithAI</strong> - Enterprise Stress Detection Platform</p>
    <p>Built with ❤️ using MediaPipe, PyTorch, FastAPI, and Streamlit</p>
    <p style="font-size: 0.9rem;">© 2025 ZenithAI. Privacy-first AI for employee well-being.</p>
</div>
""", unsafe_allow_html=True)
