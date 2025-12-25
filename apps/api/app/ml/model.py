"""
Enhanced LSTM Model with Advanced Architecture

Features:
- Multi-head attention mechanism
- Residual connections
- Layer normalization
- Deeper feature extraction
- Confidence estimation
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Optional

class MultiHeadAttention(nn.Module):
    """Multi-head attention for temporal stress patterns"""
    def __init__(self, hidden_dim: int, num_heads: int = 4):
        super().__init__()
        self.num_heads = num_heads
        self.hidden_dim = hidden_dim
        self.head_dim = hidden_dim // num_heads
        
        assert hidden_dim % num_heads == 0, "hidden_dim must be divisible by num_heads"
        
        self.query = nn.Linear(hidden_dim, hidden_dim)
        self.key = nn.Linear(hidden_dim, hidden_dim)
        self.value = nn.Linear(hidden_dim, hidden_dim)
        self.out = nn.Linear(hidden_dim, hidden_dim)
        
    def forward(self, x):
        batch_size, seq_len, _ = x.size()
        
        # Linear projections
        Q = self.query(x).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        K = self.key(x).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        V = self.value(x).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        
        # Attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)
        attn_weights = F.softmax(scores, dim=-1)
        
        # Apply attention
        context = torch.matmul(attn_weights, V)
        context = context.transpose(1, 2).contiguous().view(batch_size, seq_len, self.hidden_dim)
        
        return self.out(context), attn_weights.mean(dim=1)


class EnhancedStressLSTM(nn.Module):
    """
    Advanced LSTM model for stress detection with:
    - Bidirectional LSTM layers
    - Multi-head attention
    - Residual connections
    - Layer normalization
    - Confidence estimation
    """
    
    def __init__(
        self,
        input_dim: int = 24,
        hidden_dim: int = 128,
        num_layers: int = 3,
        output_dim: int = 3,
        dropout: float = 0.3,
        num_heads: int = 4
    ):
        super().__init__()
        
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.output_dim = output_dim
        
        # Input projection with layer norm
        self.input_proj = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        
        # Bidirectional LSTM layers
        self.lstm = nn.LSTM(
            hidden_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Multi-head attention
        self.attention = MultiHeadAttention(hidden_dim * 2, num_heads)
        
        # Layer normalization
        self.layer_norm = nn.LayerNorm(hidden_dim * 2)
        
        # Feature extraction layers with residual connections
        self.feature_extractor = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.LayerNorm(hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        
        # Classification head
        self.classifier = nn.Linear(hidden_dim // 2, output_dim)
        
        # Confidence estimation head
        self.confidence_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, hidden_dim // 4),
            nn.ReLU(),
            nn.Linear(hidden_dim // 4, 1),
            nn.Sigmoid()
        )
        
        # PyTorch's default initialization is sufficient
        # No custom weight initialization needed
    
    def forward(
        self, 
        x: torch.Tensor, 
        return_attention: bool = False,
        return_confidence: bool = False
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[torch.Tensor]]:
        """
        Forward pass
        
        Args:
            x: Input tensor of shape (batch_size, seq_len, input_dim)
            return_attention: Whether to return attention weights
            return_confidence: Whether to return confidence scores
            
        Returns:
            logits: Class logits (batch_size, output_dim)
            attention_weights: Attention weights if requested (batch_size, seq_len, seq_len)
            confidence: Confidence scores if requested (batch_size, 1)
        """
        batch_size, seq_len, _ = x.size()
        
        # Input projection
        x = self.input_proj(x)
        
        # LSTM encoding
        lstm_out, _ = self.lstm(x)
        
        # Apply attention with residual connection
        attn_out, attn_weights = self.attention(lstm_out)
        lstm_out = self.layer_norm(lstm_out + attn_out)
        
        # Use last time step for classification
        last_hidden = lstm_out[:, -1, :]
        
        # Feature extraction
        features = self.feature_extractor(last_hidden)
        
        # Classification
        logits = self.classifier(features)
        
        # Confidence estimation
        confidence = None
        if return_confidence:
            confidence = self.confidence_head(features)
        
        # Return based on flags
        if return_attention and return_confidence:
            return logits, attn_weights, confidence
        elif return_attention:
            return logits, attn_weights
        elif return_confidence:
            return logits, confidence
        else:
            return logits


class StressLSTM(nn.Module):
    """
    Original LSTM model for backward compatibility
    """
    def __init__(
        self,
        input_dim: int = 24,
        hidden_dim: int = 64,
        num_layers: int = 2,
        output_dim: int = 3,
        dropout: float = 0.3,
        bidirectional: bool = True
    ):
        super().__init__()
        
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        
        # Input projection
        self.input_proj = nn.Linear(input_dim, hidden_dim)
        
        # LSTM
        self.lstm = nn.LSTM(
            hidden_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=bidirectional,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Attention
        lstm_output_dim = hidden_dim * 2 if bidirectional else hidden_dim
        self.attention = nn.Linear(lstm_output_dim, 1)
        
        # Classifier
        self.fc = nn.Sequential(
            nn.Linear(lstm_output_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, output_dim)
        )
    
    def forward(self, x, return_attention=False):
        # Input projection
        x = self.input_proj(x)
        
        # LSTM
        lstm_out, _ = self.lstm(x)
        
        # Attention
        attn_scores = self.attention(lstm_out)
        attn_weights = F.softmax(attn_scores.squeeze(-1), dim=1)
        
        # Weighted sum
        context = torch.bmm(attn_weights.unsqueeze(1), lstm_out).squeeze(1)
        
        # Classification
        logits = self.fc(context)
        
        if return_attention:
            return logits, attn_weights
        return logits


def create_model(model_type: str = 'enhanced', **kwargs):
    """
    Factory function to create stress detection models
    
    Args:
        model_type: 'enhanced' or 'basic'
        **kwargs: Model-specific arguments
        
    Returns:
        Initialized model
    """
    if model_type == 'enhanced':
        return EnhancedStressLSTM(**kwargs)
    elif model_type == 'basic':
        return StressLSTM(**kwargs)
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    # Test the enhanced model
    model = create_model('enhanced')
    
    # Create dummy input
    batch_size = 4
    seq_len = 30
    input_dim = 24
    
    x = torch.randn(batch_size, seq_len, input_dim)
    
    # Forward pass
    logits, attn_weights, confidence = model(x, return_attention=True, return_confidence=True)
    
    print(f"Input shape: {x.shape}")
    print(f"Logits shape: {logits.shape}")
    print(f"Attention weights shape: {attn_weights.shape}")
    print(f"Confidence shape: {confidence.shape}")
    print(f"\nModel parameters: {sum(p.numel() for p in model.parameters()):,}")
