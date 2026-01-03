import numpy as np
import json
from typing import List

class StressLSTM:
    """
    Simplified LSTM implementation using NumPy for stress prediction.
    Input: Sequence of facial features [blink_rate, eye_openness, jaw_clench, brow_tension, jitter, game_score]
    Output: Stress score (0-100)
    """
    
    def __init__(self, input_dim=6, hidden_dim=32, output_dim=1):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        
        # Initialize weights randomly
        self.Wf = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.01
        self.bf = np.zeros((hidden_dim, 1))
        
        self.Wi = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.01
        self.bi = np.zeros((hidden_dim, 1))
        
        self.Wc = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.01
        self.bc = np.zeros((hidden_dim, 1))
        
        self.Wo = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.01
        self.bo = np.zeros((hidden_dim, 1))
        
        self.Wy = np.random.randn(output_dim, hidden_dim) * 0.01
        self.by = np.zeros((output_dim, 1))
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def tanh(self, x):
        return np.tanh(np.clip(x, -500, 500))
    
    def forward(self, X):
        """
        Forward pass through LSTM
        X: List of feature vectors (sequence_length, input_dim)
        """
        X = np.array(X)
        if len(X.shape) == 1:
            X = X.reshape(1, -1)
        
        seq_len = X.shape[0]
        h = np.zeros((self.hidden_dim, 1))
        c = np.zeros((self.hidden_dim, 1))
        
        for t in range(seq_len):
            x_t = X[t].reshape(-1, 1)
            concat = np.vstack([h, x_t])
            
            # Forget gate
            f_t = self.sigmoid(np.dot(self.Wf, concat) + self.bf)
            
            # Input gate
            i_t = self.sigmoid(np.dot(self.Wi, concat) + self.bi)
            
            # Candidate cell state
            c_tilde = self.tanh(np.dot(self.Wc, concat) + self.bc)
            
            # Cell state
            c = f_t * c + i_t * c_tilde
            
            # Output gate
            o_t = self.sigmoid(np.dot(self.Wo, concat) + self.bo)
            
            # Hidden state
            h = o_t * self.tanh(c)
        
        # Output layer
        y = np.dot(self.Wy, h) + self.by
        
        # Scale to 0-100 range
        stress_score = float(self.sigmoid(y[0, 0]) * 100)
        
        return stress_score
    
    def save_state_dict(self, filepath):
        """Save model weights to JSON file"""
        state = {
            'Wf': self.Wf.tolist(),
            'bf': self.bf.tolist(),
            'Wi': self.Wi.tolist(),
            'bi': self.bi.tolist(),
            'Wc': self.Wc.tolist(),
            'bc': self.bc.tolist(),
            'Wo': self.Wo.tolist(),
            'bo': self.bo.tolist(),
            'Wy': self.Wy.tolist(),
            'by': self.by.tolist(),
            'input_dim': self.input_dim,
            'hidden_dim': self.hidden_dim,
            'output_dim': self.output_dim
        }
        with open(filepath, 'w') as f:
            json.dump(state, f)
    
    def load_state_dict(self, filepath):
        """Load model weights from JSON file"""
        with open(filepath, 'r') as f:
            state = json.load(f)
        
        self.Wf = np.array(state['Wf'])
        self.bf = np.array(state['bf'])
        self.Wi = np.array(state['Wi'])
        self.bi = np.array(state['bi'])
        self.Wc = np.array(state['Wc'])
        self.bc = np.array(state['bc'])
        self.Wo = np.array(state['Wo'])
        self.bo = np.array(state['bo'])
        self.Wy = np.array(state['Wy'])
        self.by = np.array(state['by'])
        self.input_dim = state['input_dim']
        self.hidden_dim = state['hidden_dim']
        self.output_dim = state['output_dim']


def extract_features(face_data: dict) -> List[float]:
    """Extract features from face tracking data"""
    blink_rate = face_data.get('blink_rate', 0.0)
    eye_openness = face_data.get('eye_openness', 1.0)
    jaw_clench = face_data.get('jaw_clench', 0.0)
    brow_tension = face_data.get('brow_tension', 0.0) / 100.0
    jitter = face_data.get('jitter', 0.0)
    game_score = face_data.get('game_score', 0.5)
    
    return [blink_rate, eye_openness, jaw_clench, brow_tension, jitter, game_score]
