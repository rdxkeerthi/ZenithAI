# ZenithAI ML Pipeline Documentation

## Overview

This document provides a comprehensive guide to the Machine Learning pipeline for the ZenithAI stress detection system.

## Architecture

```
┌──────────────────┐
│  Raw Datasets    │
│  (WESAD, DEAP)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Data Loaders     │
│ Feature Extract  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Preprocessing    │
│ Normalization    │
│ Windowing        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ LSTM Training    │
│ (PyTorch Light.) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Model Export     │
│ (.pth checkpoint)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Inference API    │
│ (FastAPI)        │
└──────────────────┘
```

---

## 1. Dataset Acquisition

### WESAD (Wearable Stress and Affect Detection)

**Source**: https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/

**Access**: Requires academic agreement

**Structure**:
- 15 subjects (S2-S17, S1 excluded)
- Physiological signals: ECG, EDA, EMG, Respiration, Temperature
- Labels: Baseline, Stress, Amusement, Meditation
- Sampling rate: 700Hz (chest), 32Hz (wrist)

**Download Steps**:
1. Visit the dataset page
2. Fill out the academic agreement form
3. Download the ZIP file (~2GB)
4. Extract to `apps/ml-training/data/raw/WESAD/`

**Expected Directory Structure**:
```
WESAD/
├── S2/
│   └── S2.pkl
├── S3/
│   └── S3.pkl
...
└── S17/
    └── S17.pkl
```

### DEAP (Database for Emotion Analysis using Physiological Signals)

**Source**: https://www.eecs.qmul.ac.uk/mmv/datasets/deap/

**Access**: Requires academic agreement

**Structure**:
- 32 subjects
- 40 trials per subject (music videos)
- EEG (32 channels) + Physiological (8 channels)
- Self-assessment: Valence, Arousal, Dominance, Liking

**Download Steps**:
1. Request access via the website
2. Download preprocessed Python pickle files
3. Extract to `apps/ml-training/data/raw/DEAP/preprocessed/`

**Expected Directory Structure**:
```
DEAP/
└── preprocessed/
    ├── s01.dat
    ├── s02.dat
    ...
    └── s32.dat
```

### MAHNOB-HCI (Optional)

**Source**: https://mahnob-db.eu/hci-tagging/

**Note**: Requires institutional access. Can be skipped for initial training.

---

## 2. Feature Extraction

### WESAD Features

The `wesad_loader.py` extracts the following features from physiological signals:

**ECG (Electrocardiogram)**:
- Mean, Std, Skewness, Kurtosis
- → Heart Rate Variability (HRV) proxy

**EDA (Electrodermal Activity)**:
- Mean, Std, Range
- Skin Conductance Response (SCR) frequency

**Respiration**:
- Mean, Std
- Breathing rate (via FFT)

**Temperature**:
- Mean, Std, Range

**Total**: ~14 features per window

### DEAP Features

The `deap_loader.py` extracts:

**Physiological**:
- EDA: Mean, Std, Range
- Respiration: Mean, Std
- Temperature: Mean, Std

**EEG (Simplified)**:
- Frontal channels (Fp1, Fp2) power

**Stress Mapping**:
- High Arousal + Low Valence → High Stress
- High Arousal + High Valence → Medium Stress
- Low Arousal → Low Stress

**Total**: ~9 features per trial

### Temporal Windowing

- **Window Size**: 30-60 seconds (configurable)
- **Overlap**: 50% (configurable)
- **Output**: Sequences of shape `(seq_len, num_features)`

---

## 3. Model Architecture

### LSTM with Attention

```python
Input: (batch, seq_len=30, features=24)
    ↓
Input Projection: Linear(24 → 128) + ReLU + Dropout
    ↓
Bidirectional LSTM: 2 layers, hidden_dim=128
    ↓
Attention Mechanism: Bahdanau-style
    ↓
Context Vector: (batch, 256)  # 128*2 for bidirectional
    ↓
Classifier: Linear(256 → 128) → ReLU → Linear(128 → 3)
    ↓
Output: (batch, 3)  # [Low, Medium, High]
```

**Parameters**: ~450K (trainable)

**Key Features**:
- **Bidirectional**: Captures past and future context
- **Attention**: Identifies which time frames are most important
- **Dropout**: Prevents overfitting (0.3 default)

---

## 4. Training

### Quick Start

```bash
cd apps/ml-training

# Install dependencies
pip install -r requirements.txt

# Run training
python train/train_lstm.py
```

### Configuration

Edit `train/config.yaml` to customize:

```yaml
model:
  hidden_dim: 128  # LSTM hidden units
  num_layers: 2    # LSTM depth
  dropout: 0.3     # Regularization

training:
  max_epochs: 100
  learning_rate: 0.001
  batch_size: 32
  early_stopping_patience: 10
```

### Training Metrics

The training script tracks:
- **Accuracy**: Overall classification accuracy
- **F1 Score (Macro)**: Balanced metric for imbalanced classes
- **Precision & Recall**: Per-class performance

**Validation**: 15% of data held out for validation

**Test**: 15% of data held out for final evaluation

### Expected Performance

With real datasets (WESAD + DEAP):
- **Accuracy**: 75-85%
- **F1 Score**: 0.70-0.80
- **Training Time**: 10-30 minutes (GPU), 1-2 hours (CPU)

---

## 5. Model Export & Deployment

### Saving Checkpoints

Models are automatically saved to `apps/ml-training/checkpoints/` during training.

Best model format:
```
stress-lstm-epoch=42-val_f1_macro=0.782.ckpt
```

### Loading for Inference

```python
from app.ml.model import StressLSTM
import torch

# Load checkpoint
model = StressLSTM.load_from_checkpoint("path/to/checkpoint.ckpt")
model.eval()

# Inference
with torch.no_grad():
    logits, attention = model(input_tensor, return_attention=True)
    predictions = torch.argmax(logits, dim=-1)
```

### Integration with FastAPI

The inference service (`apps/api/app/services/inference_service.py`) automatically loads the latest checkpoint on startup.

---

## 6. Explainability

### Attention Weights

The model returns attention weights showing which time frames contributed most to the prediction:

```python
predictions, probs, attention_weights = model.predict_with_explanation(x)

# attention_weights shape: (batch, seq_len)
# Higher values = more important time frames
```

### SHAP Values (Optional)

For feature-level importance:

```python
import shap

explainer = shap.DeepExplainer(model, background_data)
shap_values = explainer.shap_values(test_data)

# Visualize
shap.summary_plot(shap_values, test_data)
```

---

## 7. Continuous Improvement

### Retraining Pipeline

1. **Collect New Data**: User sessions stored in database
2. **Label Data**: HR/Admin review and label stress events
3. **Augment Dataset**: Combine with WESAD/DEAP
4. **Retrain**: Run training script with updated data
5. **A/B Test**: Deploy new model to 10% of users
6. **Rollout**: Gradual rollout if metrics improve

### Monitoring

Track in production:
- **Prediction Distribution**: Are predictions balanced?
- **Confidence Scores**: Low confidence indicates model uncertainty
- **User Feedback**: Explicit "Was this accurate?" prompts

---

## 8. Troubleshooting

### Issue: Low Accuracy

**Solutions**:
- Increase `hidden_dim` (128 → 256)
- Add more LSTM layers (2 → 3)
- Reduce `dropout` (0.3 → 0.2)
- Increase training data (combine datasets)

### Issue: Overfitting

**Solutions**:
- Increase `dropout` (0.3 → 0.4)
- Add L2 regularization (`weight_decay`)
- Reduce model complexity
- Use data augmentation

### Issue: Slow Training

**Solutions**:
- Enable mixed precision (`use_amp: true`)
- Reduce `batch_size` if OOM
- Use GPU (`accelerator: gpu`)
- Reduce `num_workers` if CPU bottleneck

---

## 9. References

- **WESAD Paper**: Schmidt et al., "Introducing WESAD, a Multimodal Dataset for Wearable Stress and Affect Detection", ICMI 2018
- **DEAP Paper**: Koelstra et al., "DEAP: A Database for Emotion Analysis using Physiological Signals", IEEE Transactions on Affective Computing, 2012
- **LSTM**: Hochreiter & Schmidhuber, "Long Short-Term Memory", Neural Computation, 1997
- **Attention**: Bahdanau et al., "Neural Machine Translation by Jointly Learning to Align and Translate", ICLR 2015
