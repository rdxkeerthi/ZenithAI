"""
DEAP Dataset Loader
Dataset: Database for Emotion Analysis using Physiological Signals
Source: https://www.eecs.qmul.ac.uk/mmv/datasets/deap/

Structure:
- 32 participants
- 40 music video trials per participant
- EEG (32 channels), physiological signals (8 channels)
- Self-assessment ratings: valence, arousal, dominance, liking

For stress detection, we use:
- High arousal + low valence = stress
- Physiological signals: EDA, respiration, temperature
"""

import numpy as np
import pickle
from pathlib import Path
from typing import Tuple, List, Dict


class DEAPLoader:
    """Load and preprocess DEAP dataset for stress detection."""
    
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.fs = 128  # Sampling frequency
        
    def load_subject(self, subject_id: int) -> Dict:
        """
        Load preprocessed data for a subject.
        
        Args:
            subject_id: Subject number (1-32)
            
        Returns:
            Dictionary with 'data', 'labels' keys
        """
        filename = f"s{subject_id:02d}.dat"
        filepath = self.data_dir / "preprocessed" / filename
        
        if not filepath.exists():
            raise FileNotFoundError(f"Subject file not found: {filepath}")
            
        with open(filepath, 'rb') as f:
            subject_data = pickle.load(f, encoding='latin1')
            
        return subject_data
    
    def extract_stress_labels(self, ratings: np.ndarray) -> np.ndarray:
        """
        Convert valence-arousal ratings to stress labels.
        
        Stress mapping:
        - High arousal (>5) + Low valence (<5) = High stress (2)
        - High arousal + High valence = Medium stress (1)
        - Low arousal = Low stress (0)
        
        Args:
            ratings: (n_trials, 4) array [valence, arousal, dominance, liking]
            
        Returns:
            stress_labels: (n_trials,) array
        """
        valence = ratings[:, 0]  # 1-9 scale
        arousal = ratings[:, 1]  # 1-9 scale
        
        stress_labels = np.zeros(len(ratings), dtype=int)
        
        # High stress: high arousal + low valence
        high_stress = (arousal > 5) & (valence < 5)
        stress_labels[high_stress] = 2
        
        # Medium stress: high arousal + high valence
        medium_stress = (arousal > 5) & (valence >= 5)
        stress_labels[medium_stress] = 1
        
        # Low stress: low arousal (default 0)
        
        return stress_labels
    
    def extract_physiological_features(self, data: np.ndarray, 
                                      window_size: int = 5) -> np.ndarray:
        """
        Extract features from physiological signals.
        
        DEAP channels (after EEG):
        - 32-35: EDA, respiration, plethysmograph, temperature
        
        Args:
            data: (n_trials, n_channels, n_samples) array
            window_size: Window size in seconds
            
        Returns:
            features: (n_trials, n_features) array
        """
        n_trials = data.shape[0]
        features_list = []
        
        # Extract physiological channels (indices 32-35)
        # Note: DEAP has 40 channels total (32 EEG + 8 peripheral)
        eda_idx = 36  # Galvanic Skin Response
        resp_idx = 38  # Respiration
        temp_idx = 39  # Temperature
        
        for trial in range(n_trials):
            trial_features = []
            
            # EDA features
            if data.shape[1] > eda_idx:
                eda = data[trial, eda_idx, :]
                trial_features.extend([
                    np.mean(eda),
                    np.std(eda),
                    np.max(eda) - np.min(eda)
                ])
            else:
                trial_features.extend([0, 0, 0])
            
            # Respiration features
            if data.shape[1] > resp_idx:
                resp = data[trial, resp_idx, :]
                trial_features.extend([
                    np.mean(resp),
                    np.std(resp)
                ])
            else:
                trial_features.extend([0, 0])
            
            # Temperature features
            if data.shape[1] > temp_idx:
                temp = data[trial, temp_idx, :]
                trial_features.extend([
                    np.mean(temp),
                    np.std(temp)
                ])
            else:
                trial_features.extend([0, 0])
            
            # Add EEG band power features (optional, for richer model)
            # Using frontal channels (Fp1, Fp2) for stress
            if data.shape[1] >= 2:
                eeg_fp1 = data[trial, 0, :]
                eeg_fp2 = data[trial, 1, :]
                
                # Simple power in different bands
                trial_features.extend([
                    np.mean(eeg_fp1**2),  # Power
                    np.mean(eeg_fp2**2)
                ])
            else:
                trial_features.extend([0, 0])
                
            features_list.append(trial_features)
            
        return np.array(features_list)
    
    def load_all_subjects(self, subject_ids: List[int] = None) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load all subjects and extract features.
        
        Returns:
            X: (N, F) features
            y: (N,) stress labels
        """
        if subject_ids is None:
            subject_ids = list(range(1, 33))  # 32 subjects
            
        all_features = []
        all_labels = []
        
        for subject_id in subject_ids:
            try:
                print(f"Loading subject {subject_id}...")
                subject_data = self.load_subject(subject_id)
                
                # Extract features from physiological signals
                features = self.extract_physiological_features(subject_data['data'])
                
                # Convert ratings to stress labels
                labels = self.extract_stress_labels(subject_data['labels'])
                
                all_features.append(features)
                all_labels.append(labels)
                
            except FileNotFoundError:
                print(f"Warning: Subject {subject_id} not found, skipping...")
                continue
                
        X = np.vstack(all_features)
        y = np.concatenate(all_labels)
        
        print(f"Loaded {len(X)} samples from {len(subject_ids)} subjects")
        print(f"Feature shape: {X.shape}")
        print(f"Label distribution: {np.bincount(y)}")
        
        return X, y


if __name__ == "__main__":
    loader = DEAPLoader("apps/ml-training/data/raw/DEAP")
    
    print("DEAP Loader ready. Download dataset from:")
    print("https://www.eecs.qmul.ac.uk/mmv/datasets/deap/")
    print("Requires academic agreement.")
