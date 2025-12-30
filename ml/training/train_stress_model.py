"""
Stress Classification Model Training
Uses LSTM to analyze temporal facial landmark sequences for stress detection
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class StressModelTrainer:
    def __init__(self, sequence_length=30, n_landmarks=468):
        """
        Initialize the stress model trainer
        
        Args:
            sequence_length: Number of frames in each sequence
            n_landmarks: Number of facial landmarks (MediaPipe uses 468)
        """
        self.sequence_length = sequence_length
        self.n_landmarks = n_landmarks
        self.n_features = n_landmarks * 3  # x, y, z coordinates
        self.model = None
        self.scaler = StandardScaler()
        
    def generate_synthetic_data(self, n_samples=5000):
        """
        Generate synthetic training data for stress detection
        In production, replace with real labeled data
        """
        print("Generating synthetic training data...")
        
        X = []
        y = []
        
        for i in range(n_samples):
            # Generate sequence of facial landmarks
            sequence = np.random.randn(self.sequence_length, self.n_features)
            
            # Simulate stress patterns
            stress_level = np.random.choice([0, 1, 2])  # 0=low, 1=medium, 2=high
            
            if stress_level == 2:  # High stress
                # Add tension patterns (increased movement, furrowed brows)
                sequence[:, :50] += np.random.randn(self.sequence_length, 50) * 0.5
                sequence[:, 100:150] -= 0.3  # Brow furrow
            elif stress_level == 1:  # Medium stress
                sequence[:, :50] += np.random.randn(self.sequence_length, 50) * 0.3
            
            X.append(sequence)
            y.append(stress_level)
        
        return np.array(X), np.array(y)
    
    def build_model(self):
        """Build LSTM-based stress classification model"""
        print("Building LSTM model...")
        
        model = keras.Sequential([
            # Input layer
            layers.Input(shape=(self.sequence_length, self.n_features)),
            
            # LSTM layers for temporal analysis
            layers.LSTM(128, return_sequences=True),
            layers.Dropout(0.3),
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.3),
            layers.LSTM(32),
            layers.Dropout(0.3),
            
            # Dense layers for classification
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(32, activation='relu'),
            
            # Output layer (3 classes: low, medium, high stress)
            layers.Dense(3, activation='softmax')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def train(self, X, y, epochs=50, batch_size=32, validation_split=0.2):
        """Train the stress classification model"""
        print(f"Training model for {epochs} epochs...")
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42
        )
        
        # Normalize data
        X_train_flat = X_train.reshape(-1, self.n_features)
        X_val_flat = X_val.reshape(-1, self.n_features)
        
        X_train_scaled = self.scaler.fit_transform(X_train_flat)
        X_val_scaled = self.scaler.transform(X_val_flat)
        
        X_train = X_train_scaled.reshape(-1, self.sequence_length, self.n_features)
        X_val = X_val_scaled.reshape(-1, self.sequence_length, self.n_features)
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=0.00001
            )
        ]
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def save_model(self, model_path='../trained/stress_classifier.h5', 
                   scaler_path='../trained/scaler.pkl'):
        """Save trained model and scaler"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        print(f"Saving model to {model_path}...")
        self.model.save(model_path)
        
        print(f"Saving scaler to {scaler_path}...")
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        print("Model and scaler saved successfully!")
    
    def evaluate(self, X_test, y_test):
        """Evaluate model performance"""
        # Normalize test data
        X_test_flat = X_test.reshape(-1, self.n_features)
        X_test_scaled = self.scaler.transform(X_test_flat)
        X_test = X_test_scaled.reshape(-1, self.sequence_length, self.n_features)
        
        loss, accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"\nTest Loss: {loss:.4f}")
        print(f"Test Accuracy: {accuracy:.4f}")
        
        return loss, accuracy

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("AI Stress Detection - Model Training")
    print("=" * 60)
    
    # Initialize trainer
    trainer = StressModelTrainer(sequence_length=30, n_landmarks=468)
    
    # Generate synthetic data
    X, y = trainer.generate_synthetic_data(n_samples=5000)
    print(f"Generated {len(X)} samples")
    print(f"Data shape: {X.shape}")
    print(f"Labels distribution: {np.bincount(y)}")
    
    # Build model
    model = trainer.build_model()
    model.summary()
    
    # Train model
    history = trainer.train(X, y, epochs=50, batch_size=32)
    
    # Evaluate on test set
    X_test, y_test = trainer.generate_synthetic_data(n_samples=1000)
    trainer.evaluate(X_test, y_test)
    
    # Save model
    trainer.save_model()
    
    print("\n" + "=" * 60)
    print("Training completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
