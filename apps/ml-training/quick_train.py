"""
Quick Model Training Script

Creates a trained LSTM model with synthetic data for immediate use.
This allows the system to run without waiting for real dataset downloads.
"""

import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from apps.api.app.ml.model import StressLSTM

def create_synthetic_dataset(num_samples=1000, seq_len=30, num_features=24):
    """Create synthetic stress detection dataset."""
    print("Generating synthetic training data...")
    
    X = []
    y = []
    
    for _ in range(num_samples):
        # Random stress level
        stress_class = np.random.randint(0, 3)  # 0=Low, 1=Medium, 2=High
        
        # Generate sequence with class-dependent patterns
        if stress_class == 0:  # Low stress
            # Relaxed: higher blink rate, normal eye openness
            base_features = np.random.randn(seq_len, num_features) * 0.3
            base_features[:, 0] = np.random.uniform(15, 25, seq_len)  # Blink rate
            base_features[:, 1] = np.random.uniform(0.3, 0.4, seq_len)  # Eye openness
            
        elif stress_class == 1:  # Medium stress
            # Moderate: medium blink rate, some tension
            base_features = np.random.randn(seq_len, num_features) * 0.5
            base_features[:, 0] = np.random.uniform(10, 15, seq_len)
            base_features[:, 1] = np.random.uniform(0.25, 0.35, seq_len)
            
        else:  # High stress
            # Stressed: low blink rate, tension markers
            base_features = np.random.randn(seq_len, num_features) * 0.7
            base_features[:, 0] = np.random.uniform(5, 10, seq_len)
            base_features[:, 1] = np.random.uniform(0.15, 0.25, seq_len)
        
        X.append(base_features)
        y.append(stress_class)
    
    return np.array(X), np.array(y)

def train_model():
    """Train a simple model for demonstration."""
    print("="*60)
    print("ZenithAI - Quick Model Training")
    print("="*60)
    
    # Create dataset
    X_train, y_train = create_synthetic_dataset(num_samples=800)
    X_val, y_val = create_synthetic_dataset(num_samples=200)
    
    print(f"Training set: {X_train.shape}")
    print(f"Validation set: {X_val.shape}")
    
    # Convert to tensors
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.LongTensor(y_train)
    X_val_t = torch.FloatTensor(X_val)
    y_val_t = torch.LongTensor(y_val)
    
    # Create model
    print("\nInitializing LSTM model...")
    model = StressLSTM(
        input_dim=24,
        hidden_dim=64,
        num_layers=2,
        output_dim=3,
        dropout=0.3,
        bidirectional=True
    )
    
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Training setup
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Training loop
    print("\nTraining model...")
    num_epochs = 50
    batch_size = 32
    
    best_val_acc = 0
    
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        # Mini-batch training
        for i in range(0, len(X_train_t), batch_size):
            batch_X = X_train_t[i:i+batch_size]
            batch_y = y_train_t[i:i+batch_size]
            
            optimizer.zero_grad()
            outputs, _ = model(batch_X, return_attention=False)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += batch_y.size(0)
            correct += (predicted == batch_y).sum().item()
        
        train_acc = 100 * correct / total
        
        # Validation
        model.eval()
        with torch.no_grad():
            val_outputs, _ = model(X_val_t, return_attention=False)
            _, val_predicted = torch.max(val_outputs.data, 1)
            val_acc = 100 * (val_predicted == y_val_t).sum().item() / len(y_val_t)
        
        if val_acc > best_val_acc:
            best_val_acc = val_acc
        
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{num_epochs}] "
                  f"Loss: {total_loss/len(X_train_t):.4f} "
                  f"Train Acc: {train_acc:.2f}% "
                  f"Val Acc: {val_acc:.2f}%")
    
    print(f"\n✅ Training complete! Best validation accuracy: {best_val_acc:.2f}%")
    
    # Save model
    save_dir = Path(__file__).parent.parent / "api" / "models"
    save_dir.mkdir(exist_ok=True)
    save_path = save_dir / "stress_lstm_trained.pth"
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'model_config': {
            'input_dim': 24,
            'hidden_dim': 64,
            'num_layers': 2,
            'output_dim': 3,
            'dropout': 0.3,
            'bidirectional': True
        },
        'accuracy': best_val_acc,
        'training_info': 'Synthetic data - Demo model'
    }, save_path)
    
    print(f"✅ Model saved to: {save_path}")
    print("\n" + "="*60)
    print("Model is ready to use!")
    print("="*60)
    
    return model, save_path

if __name__ == "__main__":
    model, path = train_model()
    print(f"\nTo use this model, the inference service will load from:")
    print(f"  {path}")
