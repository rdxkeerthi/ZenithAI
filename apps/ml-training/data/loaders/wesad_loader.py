"""
WESAD Dataset Loader
Dataset: Wearable Stress and Affect Detection
Source: https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/

Structure:
- Physiological signals (chest/wrist sensors): ACC, ECG, EDA, EMG, Resp, Temp
- Labels: 1=baseline, 2=stress, 3=amusement, 4=meditation
- Sampling rates: 700Hz (chest), 32Hz (wrist)

This loader extracts time-aligned features for stress classification.
"""

import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, List
from scipy import signal
from scipy.stats import skew, kurtosis


class WESADLoader:
    """Load and preprocess WESAD dataset."""
    
    LABEL_MAP = {
        0: 'transient',
        1: 'baseline',
        2: 'stress',
        3: 'amusement',
        4: 'meditation'
    }
    
    STRESS_LABELS = {
        'baseline': 0,  # Low stress
        'stress': 2,    # High stress
        'amusement': 1, # Medium
        'meditation': 0 # Low
    }
    
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        
    def load_subject(self, subject_id: str) -> Dict:
        """
        Load data for a single subject.
        
        Args:
            subject_id: Subject identifier (e.g., 'S2', 'S3', ...)
            
        Returns:
            Dictionary with 'signal', 'label', 'subject' keys
        """
        pkl_path = self.data_dir / subject_id / f"{subject_id}.pkl"
        
        if not pkl_path.exists():
            raise FileNotFoundError(f"Subject data not found: {pkl_path}")
            
        with open(pkl_path, 'rb') as f:
            data = pickle.load(f, encoding='latin1')
            
        return data
    
    def extract_features(self, signal_data: Dict, window_size: int = 60, 
                        overlap: float = 0.5) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract time-domain and frequency-domain features from physiological signals.
        
        Args:
            signal_data: Raw signal dictionary from WESAD
            window_size: Window size in seconds
            overlap: Overlap ratio (0-1)
            
        Returns:
            features: (N, F) array of features
            labels: (N,) array of stress labels
        """
        # Extract chest signals (higher quality)
        chest = signal_data['signal']['chest']
        labels = signal_data['label']
        
        # Sampling rates
        fs_acc = 700  # ACC, ECG
        fs_eda = 700  # EDA
        fs_temp = 700 # Temp
        fs_resp = 700 # Resp
        
        # Window parameters
        window_samples = window_size * fs_acc
        step_samples = int(window_samples * (1 - overlap))
        
        features_list = []
        labels_list = []
        
        # Sliding window
        for start in range(0, len(labels) - window_samples, step_samples):
            end = start + window_samples
            
            # Get window label (majority vote)
            window_labels = labels[start:end]
            label_mode = np.bincount(window_labels).argmax()
            
            # Skip transient periods
            if label_mode == 0:
                continue
                
            # Extract features for this window
            window_features = []
            
            # ECG features
            ecg = chest['ECG'][start:end]
            window_features.extend(self._ecg_features(ecg, fs_acc))
            
            # EDA features
            eda = chest['EDA'][start:end]
            window_features.extend(self._eda_features(eda, fs_eda))
            
            # Respiration features
            resp = chest['Resp'][start:end]
            window_features.extend(self._resp_features(resp, fs_resp))
            
            # Temperature features
            temp = chest['Temp'][start:end]
            window_features.extend(self._temp_features(temp, fs_temp))
            
            features_list.append(window_features)
            
            # Map to stress level
            label_name = self.LABEL_MAP[label_mode]
            stress_level = self.STRESS_LABELS.get(label_name, 1)
            labels_list.append(stress_level)
            
        return np.array(features_list), np.array(labels_list)
    
    def _ecg_features(self, ecg: np.ndarray, fs: int) -> List[float]:
        """Extract heart rate variability features."""
        # Simple HRV approximation (production would use proper R-peak detection)
        features = [
            np.mean(ecg),
            np.std(ecg),
            skew(ecg),
            kurtosis(ecg)
        ]
        return features
    
    def _eda_features(self, eda: np.ndarray, fs: int) -> List[float]:
        """Extract electrodermal activity features."""
        # Tonic (slow) and phasic (fast) components
        features = [
            np.mean(eda),
            np.std(eda),
            np.max(eda) - np.min(eda),  # Range
            len(self._find_peaks(eda)) / (len(eda) / fs)  # SCR frequency
        ]
        return features
    
    def _resp_features(self, resp: np.ndarray, fs: int) -> List[float]:
        """Extract respiration features."""
        features = [
            np.mean(resp),
            np.std(resp),
            self._estimate_breathing_rate(resp, fs)
        ]
        return features
    
    def _temp_features(self, temp: np.ndarray, fs: int) -> List[float]:
        """Extract temperature features."""
        features = [
            np.mean(temp),
            np.std(temp),
            np.max(temp) - np.min(temp)
        ]
        return features
    
    def _find_peaks(self, signal: np.ndarray, threshold: float = 0.1) -> np.ndarray:
        """Simple peak detection."""
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(signal, height=threshold)
        return peaks
    
    def _estimate_breathing_rate(self, resp: np.ndarray, fs: int) -> float:
        """Estimate breathing rate from respiration signal."""
        # FFT-based frequency estimation
        fft = np.fft.fft(resp)
        freqs = np.fft.fftfreq(len(resp), 1/fs)
        
        # Breathing is typically 0.1-0.5 Hz (6-30 breaths/min)
        valid_idx = (freqs > 0.1) & (freqs < 0.5)
        if not np.any(valid_idx):
            return 15.0  # Default
            
        peak_freq = freqs[valid_idx][np.argmax(np.abs(fft[valid_idx]))]
        return peak_freq * 60  # Convert to breaths per minute
    
    def load_all_subjects(self, subject_ids: List[str] = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Load and process all subjects.
        
        Returns:
            X: (N, F) features
            y: (N,) labels
            subjects: (N,) subject IDs
        """
        if subject_ids is None:
            # Default WESAD subjects
            subject_ids = [f'S{i}' for i in range(2, 18)]  # S2-S17
            
        all_features = []
        all_labels = []
        all_subjects = []
        
        for subject_id in subject_ids:
            try:
                print(f"Loading {subject_id}...")
                data = self.load_subject(subject_id)
                features, labels = self.extract_features(data)
                
                all_features.append(features)
                all_labels.append(labels)
                all_subjects.extend([subject_id] * len(labels))
                
            except FileNotFoundError:
                print(f"Warning: {subject_id} not found, skipping...")
                continue
                
        X = np.vstack(all_features)
        y = np.concatenate(all_labels)
        subjects = np.array(all_subjects)
        
        print(f"Loaded {len(X)} samples from {len(subject_ids)} subjects")
        print(f"Feature shape: {X.shape}")
        print(f"Label distribution: {np.bincount(y)}")
        
        return X, y, subjects


if __name__ == "__main__":
    # Example usage
    loader = WESADLoader("apps/ml-training/data/raw/WESAD")
    
    # Load single subject
    # data = loader.load_subject('S2')
    # features, labels = loader.extract_features(data)
    
    # Load all subjects
    # X, y, subjects = loader.load_all_subjects()
    
    print("WESAD Loader ready. Download dataset from:")
    print("https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/")
