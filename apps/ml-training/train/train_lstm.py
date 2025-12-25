"""
PyTorch Lightning Training Script for Stress Detection LSTM

Production-grade training with:
- Automatic mixed precision
- Gradient clipping
- Early stopping
- Model checkpointing
- Comprehensive metrics
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping
from pytorch_lightning.loggers import WandbLogger
import numpy as np
import yaml
from pathlib import Path
from typing import Dict, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
import torchmetrics

import sys
sys.path.append(str(Path(__file__).parent.parent))
from app.ml.model import create_model


class StressDataset(Dataset):
    """Dataset for stress detection sequences."""
    
    def __init__(self, sequences: np.ndarray, labels: np.ndarray):
        """
        Args:
            sequences: (N, seq_len, features)
            labels: (N,)
        """
        self.sequences = torch.FloatTensor(sequences)
        self.labels = torch.LongTensor(labels)
        
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, idx):
        return self.sequences[idx], self.labels[idx]


class StressLightningModule(pl.LightningModule):
    """Lightning module for training stress detection model."""
    
    def __init__(self, config: Dict):
        super().__init__()
        self.save_hyperparameters(config)
        self.config = config
        
        # Create model
        self.model = create_model(config['model'])
        
        # Loss function
        if config['training'].get('use_class_weights', False):
            # Will be set in setup() after seeing data
            self.class_weights = None
        else:
            self.class_weights = None
            
        # Metrics
        num_classes = config['model']['output_dim']
        self.train_acc = torchmetrics.Accuracy(task='multiclass', num_classes=num_classes)
        self.val_acc = torchmetrics.Accuracy(task='multiclass', num_classes=num_classes)
        self.val_f1 = torchmetrics.F1Score(task='multiclass', num_classes=num_classes, average='macro')
        self.val_precision = torchmetrics.Precision(task='multiclass', num_classes=num_classes, average='macro')
        self.val_recall = torchmetrics.Recall(task='multiclass', num_classes=num_classes, average='macro')
        
    def forward(self, x):
        return self.model(x, return_attention=False)[0]
    
    def training_step(self, batch, batch_idx):
        x, y = batch
        logits, _ = self.model(x, return_attention=False)
        
        # Loss
        if self.class_weights is not None:
            loss = F.cross_entropy(logits, y, weight=self.class_weights)
        else:
            loss = F.cross_entropy(logits, y)
        
        # Metrics
        preds = torch.argmax(logits, dim=1)
        acc = self.train_acc(preds, y)
        
        # Logging
        self.log('train_loss', loss, on_step=True, on_epoch=True, prog_bar=True)
        self.log('train_acc', acc, on_step=False, on_epoch=True, prog_bar=True)
        
        return loss
    
    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits, _ = self.model(x, return_attention=False)
        
        loss = F.cross_entropy(logits, y)
        preds = torch.argmax(logits, dim=1)
        
        # Update metrics
        self.val_acc(preds, y)
        self.val_f1(preds, y)
        self.val_precision(preds, y)
        self.val_recall(preds, y)
        
        self.log('val_loss', loss, prog_bar=True)
        
        return loss
    
    def on_validation_epoch_end(self):
        # Compute and log metrics
        self.log('val_acc', self.val_acc.compute())
        self.log('val_f1_macro', self.val_f1.compute())
        self.log('val_precision', self.val_precision.compute())
        self.log('val_recall', self.val_recall.compute())
        
        # Reset metrics
        self.val_acc.reset()
        self.val_f1.reset()
        self.val_precision.reset()
        self.val_recall.reset()
    
    def configure_optimizers(self):
        optimizer_name = self.config['training']['optimizer']
        lr = self.config['training']['learning_rate']
        weight_decay = self.config['training']['weight_decay']
        
        if optimizer_name == 'adam':
            optimizer = torch.optim.Adam(self.parameters(), lr=lr, weight_decay=weight_decay)
        elif optimizer_name == 'adamw':
            optimizer = torch.optim.AdamW(self.parameters(), lr=lr, weight_decay=weight_decay)
        else:
            optimizer = torch.optim.SGD(self.parameters(), lr=lr, weight_decay=weight_decay, momentum=0.9)
        
        # Scheduler
        scheduler_name = self.config['training']['scheduler']
        if scheduler_name == 'reduce_on_plateau':
            scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
                optimizer, mode='max', factor=0.5, patience=5, verbose=True
            )
            return {
                'optimizer': optimizer,
                'lr_scheduler': {
                    'scheduler': scheduler,
                    'monitor': 'val_f1_macro'
                }
            }
        elif scheduler_name == 'cosine':
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=self.config['training']['max_epochs']
            )
            return [optimizer], [scheduler]
        else:
            return optimizer


def create_synthetic_data(num_samples: int = 1000, seq_len: int = 30, 
                         num_features: int = 24) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create synthetic stress data for demonstration.
    Replace this with real dataset loaders when available.
    """
    print("Generating synthetic data (replace with real datasets)...")
    
    sequences = []
    labels = []
    
    for _ in range(num_samples):
        # Random class
        label = np.random.randint(0, 3)
        
        # Generate sequence with class-dependent patterns
        if label == 0:  # Low stress
            seq = np.random.randn(seq_len, num_features) * 0.5
        elif label == 1:  # Medium stress
            seq = np.random.randn(seq_len, num_features) * 1.0 + 0.5
        else:  # High stress
            seq = np.random.randn(seq_len, num_features) * 1.5 + 1.0
            
        sequences.append(seq)
        labels.append(label)
    
    return np.array(sequences), np.array(labels)


def main():
    # Load config
    config_path = Path(__file__).parent / "config.yaml"
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Set seed
    pl.seed_everything(config['seed'])
    
    # Load or generate data
    # TODO: Replace with real dataset loaders
    print("Loading data...")
    X, y = create_synthetic_data(
        num_samples=1000,
        seq_len=config['data']['sequence_length'],
        num_features=config['model']['input_dim']
    )
    
    print(f"Data shape: {X.shape}, Labels: {y.shape}")
    print(f"Class distribution: {np.bincount(y)}")
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=(1 - config['data']['train_split']), random_state=config['seed'], stratify=y
    )
    
    val_ratio = config['data']['val_split'] / (config['data']['val_split'] + config['data']['test_split'])
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=(1 - val_ratio), random_state=config['seed'], stratify=y_temp
    )
    
    print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    # Create datasets
    train_dataset = StressDataset(X_train, y_train)
    val_dataset = StressDataset(X_val, y_val)
    test_dataset = StressDataset(X_test, y_test)
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset, 
        batch_size=config['data']['batch_size'],
        shuffle=True,
        num_workers=config['data']['num_workers']
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=config['data']['batch_size'],
        num_workers=config['data']['num_workers']
    )
    
    # Compute class weights
    if config['training'].get('use_class_weights', False):
        class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
        class_weights = torch.FloatTensor(class_weights)
        print(f"Class weights: {class_weights}")
    else:
        class_weights = None
    
    # Create model
    model = StressLightningModule(config)
    if class_weights is not None:
        model.class_weights = class_weights.to(model.device)
    
    # Callbacks
    checkpoint_callback = ModelCheckpoint(
        dirpath=config['checkpoint']['save_dir'],
        filename='stress-lstm-{epoch:02d}-{val_f1_macro:.3f}',
        monitor=config['checkpoint']['monitor'],
        mode=config['checkpoint']['mode'],
        save_top_k=config['checkpoint']['save_top_k'],
        verbose=True
    )
    
    early_stop_callback = EarlyStopping(
        monitor=config['checkpoint']['monitor'],
        patience=config['training']['early_stopping_patience'],
        mode=config['checkpoint']['mode'],
        verbose=True
    )
    
    # Logger
    logger = None
    if config['logging'].get('use_wandb', False):
        logger = WandbLogger(project=config['logging']['wandb_project'])
    
    # Trainer
    trainer = pl.Trainer(
        max_epochs=config['training']['max_epochs'],
        accelerator=config['accelerator'],
        devices=config['devices'],
        callbacks=[checkpoint_callback, early_stop_callback],
        logger=logger,
        gradient_clip_val=config['training']['gradient_clip_val'],
        precision='16-mixed' if config['training']['use_amp'] else 32,
        log_every_n_steps=config['logging']['log_every_n_steps']
    )
    
    # Train
    print("Starting training...")
    trainer.fit(model, train_loader, val_loader)
    
    # Test
    print("Evaluating on test set...")
    test_loader = DataLoader(test_dataset, batch_size=config['data']['batch_size'])
    trainer.test(model, test_loader)
    
    print(f"Best model saved to: {checkpoint_callback.best_model_path}")


if __name__ == "__main__":
    main()
