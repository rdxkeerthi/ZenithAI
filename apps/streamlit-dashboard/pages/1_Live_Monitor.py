"""
Live Stress Monitor Page

Real-time webcam-based stress detection with:
- Live camera feed
- Real-time stress graph
- Feature visualization
- Confidence scores
"""

import streamlit as st
import cv2
import numpy as np
import plotly.graph_objects as go
from collections import deque
import time
import json
import websocket
from threading import Thread

st.set_page_config(page_title="Live Monitor", page_icon="📹", layout="wide")

# Initialize session state
if 'stress_history' not in st.session_state:
    st.session_state.stress_history = deque(maxlen=60)  # Last 60 seconds
    st.session_state.time_history = deque(maxlen=60)
    st.session_state.current_stress = 0.0
    st.session_state.current_level = "CALIBRATING"
    st.session_state.is_monitoring = False

st.markdown("# 📹 Live Stress Monitor")
st.markdown("Real-time stress detection using your webcam and AI")

# Layout
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### Camera Feed")
    
    # Camera placeholder
    camera_placeholder = st.empty()
    
    # Mock camera feed (in production, use streamlit-webrtc)
    camera_placeholder.info("""
    **Camera Integration**
    
    In production, this uses `streamlit-webrtc` for real-time video processing.
    
    For this demo:
    1. The Next.js client handles camera access
    2. MediaPipe runs in the browser
    3. Features are sent via WebSocket
    4. This dashboard displays results
    
    **To enable live camera here:**
    ```python
    from streamlit_webrtc import webrtc_streamer
    webrtc_streamer(key="stress-monitor")
    ```
    """)
    
    # Control buttons
    col_btn1, col_btn2, col_btn3 = st.columns(3)
    with col_btn1:
        if st.button("▶️ Start Monitoring", use_container_width=True):
            st.session_state.is_monitoring = True
            st.success("Monitoring started!")
    
    with col_btn2:
        if st.button("⏸️ Pause", use_container_width=True):
            st.session_state.is_monitoring = False
            st.warning("Monitoring paused")
    
    with col_btn3:
        if st.button("🔄 Reset", use_container_width=True):
            st.session_state.stress_history.clear()
            st.session_state.time_history.clear()
            st.info("History cleared")

with col2:
    st.markdown("### Current Status")
    
    # Stress level display
    stress_level = st.session_state.current_level
    stress_score = st.session_state.current_stress
    
    if stress_level == "LOW":
        st.success(f"### {stress_level}")
        color = "#10B981"
    elif stress_level == "MEDIUM":
        st.warning(f"### {stress_level}")
        color = "#F59E0B"
    elif stress_level == "HIGH":
        st.error(f"### {stress_level}")
        color = "#EF4444"
    else:
        st.info(f"### {stress_level}")
        color = "#64748B"
    
    # Stress score
    st.metric("Stress Index", f"{stress_score * 100:.1f}%", 
             delta=f"{np.random.randint(-5, 5)}%" if len(st.session_state.stress_history) > 0 else None,
             delta_color="inverse")
    
    # Confidence
    st.metric("Confidence", f"{np.random.uniform(0.75, 0.95):.1%}")
    
    # Session info
    st.markdown("---")
    st.markdown("**Session Info**")
    st.text(f"Duration: {len(st.session_state.stress_history)}s")
    st.text(f"Samples: {len(st.session_state.stress_history)}")

# Real-time graph
st.markdown("---")
st.markdown("### 📊 Real-Time Stress Graph (Last 60 seconds)")

# Simulate real-time data
if st.session_state.is_monitoring:
    # Mock stress data
    current_time = time.time()
    mock_stress = np.random.uniform(0.2, 0.8)
    
    st.session_state.stress_history.append(mock_stress)
    st.session_state.time_history.append(current_time)
    st.session_state.current_stress = mock_stress
    
    # Determine level
    if mock_stress < 0.33:
        st.session_state.current_level = "LOW"
    elif mock_stress < 0.66:
        st.session_state.current_level = "MEDIUM"
    else:
        st.session_state.current_level = "HIGH"

# Plot
if len(st.session_state.stress_history) > 0:
    times = list(st.session_state.time_history)
    stresses = list(st.session_state.stress_history)
    
    # Convert to relative time
    if len(times) > 0:
        relative_times = [(t - times[0]) for t in times]
    else:
        relative_times = []
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=relative_times,
        y=stresses,
        mode='lines+markers',
        name='Stress Level',
        line=dict(color='#0EA5E9', width=3),
        marker=dict(size=6),
        fill='tozeroy',
        fillcolor='rgba(14, 165, 233, 0.1)'
    ))
    
    # Threshold lines
    fig.add_hline(y=0.33, line_dash="dash", line_color="green", 
                  annotation_text="Low/Medium Threshold")
    fig.add_hline(y=0.66, line_dash="dash", line_color="orange", 
                  annotation_text="Medium/High Threshold")
    
    fig.update_layout(
        xaxis_title="Time (seconds)",
        yaxis_title="Stress Level",
        yaxis_range=[0, 1],
        height=400,
        hovermode='x unified',
        template='plotly_white'
    )
    
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("Start monitoring to see real-time stress graph")

# Feature breakdown
st.markdown("---")
st.markdown("### 🔍 Feature Analysis")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("**Facial Features**")
    st.progress(np.random.uniform(0.3, 0.7), text="Brow Tension")
    st.progress(np.random.uniform(0.2, 0.6), text="Eye Openness")
    st.progress(np.random.uniform(0.4, 0.8), text="Mouth Corners")

with col2:
    st.markdown("**Temporal Features**")
    st.progress(np.random.uniform(0.1, 0.5), text="Blink Rate")
    st.progress(np.random.uniform(0.3, 0.7), text="Head Movement")
    st.progress(np.random.uniform(0.2, 0.6), text="Micro-expressions")

with col3:
    st.markdown("**Attention Weights**")
    st.progress(np.random.uniform(0.6, 0.9), text="Recent Frames (0-10s)")
    st.progress(np.random.uniform(0.3, 0.6), text="Mid Frames (10-20s)")
    st.progress(np.random.uniform(0.1, 0.4), text="Early Frames (20-30s)")

# Auto-refresh
if st.session_state.is_monitoring:
    time.sleep(1)
    st.rerun()
