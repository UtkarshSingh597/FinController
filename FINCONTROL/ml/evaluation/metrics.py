"""Model Evaluation and Outlier Contamination Calibration Metrics."""

from typing import Dict
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score

def evaluate_anomaly_detector(
    y_true: np.ndarray,
    anomaly_scores: np.ndarray,
    threshold: float = 0.70,
) -> Dict[str, float]:
    """Calculate diagnostic evaluation metrics for outlier detectors."""
    y_pred = (anomaly_scores >= threshold).astype(int)

    return {
        "precision": float(round(precision_score(y_true, y_pred, zero_division=0), 4)),
        "recall": float(round(recall_score(y_true, y_pred, zero_division=0), 4)),
        "f1_score": float(round(f1_score(y_true, y_pred, zero_division=0), 4)),
        "roc_auc": float(round(roc_auc_score(y_true, anomaly_scores), 4)) if len(np.unique(y_true)) > 1 else 1.0,
        "active_threshold": threshold,
    }
