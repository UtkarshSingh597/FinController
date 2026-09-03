"""Feature engineering and preprocessing pipeline for financial anomaly detection."""

from typing import Any, Dict, List
import numpy as np

FEATURE_NAMES = [
    "amount",
    "processing_latency_ms",
    "failure_velocity_1h",
    "refund_ratio_7d",
    "hour_of_day"
]

def extract_transaction_features(transaction: Dict[str, Any]) -> np.ndarray:
    """Transform a single transaction dictionary into a normalized feature vector."""
    amount = float(transaction.get("amount", 0.0))
    latency = float(transaction.get("latency_ms", 300.0))
    failure_vel = float(transaction.get("failure_velocity", 0.0))
    refund_ratio = float(transaction.get("refund_ratio", 0.02))
    hour = float(transaction.get("hour_of_day", 12.0)) / 24.0

    return np.array([amount, latency, failure_vel, refund_ratio, hour], dtype=np.float32)

def batch_extract_features(transactions: List[Dict[str, Any]]) -> np.ndarray:
    """Transform a batch of transactions into a feature matrix (N, num_features)."""
    return np.array([extract_transaction_features(tx) for tx in transactions])
