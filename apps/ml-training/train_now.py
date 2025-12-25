import torch
import torch.nn as nn
import numpy as np
from pathlib import Path

class SimpleLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(24, 64, 2, batch_first=True, bidirectional=True, dropout=0.3)
        self.attention = nn.Linear(128, 1)
        self.fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 3)
        )
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        scores = self.attention(lstm_out)
        attention_weights = torch.softmax(scores.squeeze(-1), dim=1)
        context = torch.bmm(attention_weights.unsqueeze(1), lstm_out).squeeze(1)
        return self.fc(context), attention_weights

# Generate synthetic data
print("Generating training data...")
X_train = []
y_train = []

for _ in range(1000):
    stress = np.random.randint(0, 3)
    seq = np.random.randn(30, 24) * (0.5 + stress * 0.3)
    seq[:, 0] = np.random.uniform(20-stress*5, 25-stress*5, 30)  # Blink rate
    X_train.append(seq)
    y_train.append(stress)

X_train = torch.FloatTensor(np.array(X_train))
y_train = torch.LongTensor(np.array(y_train))

# Train
print("Training model...")
model = SimpleLSTM()
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(30):
    optimizer.zero_grad()
    outputs, _ = model(X_train)
    loss = criterion(outputs, y_train)
    loss.backward()
    optimizer.step()
    
    if (epoch + 1) % 10 == 0:
        _, predicted = torch.max(outputs, 1)
        acc = (predicted == y_train).sum().item() / len(y_train) * 100
        print(f"Epoch {epoch+1}/30 - Loss: {loss.item():.4f} - Acc: {acc:.2f}%")

# Save
save_path = Path("../api/models/stress_lstm_trained.pth")
save_path.parent.mkdir(exist_ok=True)

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
    'accuracy': acc,
    'training_info': 'Quick-trained model for demo'
}, save_path)

print(f"\n✅ Model saved to: {save_path}")
print(f"✅ Accuracy: {acc:.2f}%")
