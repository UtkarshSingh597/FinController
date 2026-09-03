"""Training Pipeline for Financial Anomaly Detection Models."""

import os
import joblib
import numpy as np
from pathlib import Path
from ..models.isolation_forest import FinancialAnomalyDetector

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "artifacts"

def generate_synthetic_training_data(n_samples: int = 2000) -> np.ndarray:
    """Generate realistic baseline financial telemetry feature matrix."""
    np.random.seed(42)
    # [amount, latency_ms, failure_velocity, refund_ratio, hour_of_day]
    normal_amounts = np.random.lognormal(mean=4.5, sigma=0.8, size=n_samples)
    normal_latencies = np.random.normal(loc=350, scale=80, size=n_samples)
    normal_failure_vel = np.random.poisson(lam=1.2, size=n_samples)
    normal_refunds = np.random.beta(a=2, b=98, size=n_samples)
    hours = np.random.uniform(0.0, 1.0, size=n_samples)

    features = np.column_stack([
        normal_amounts,
        np.clip(normal_latencies, 50, 1500),
        normal_failure_vel,
        normal_refunds,
        hours
    ])
    return features

def train_and_export_model(artifact_name: str = "isolation_forest_v1.joblib") -> Path:
    """Train Isolation Forest and persist artifact to ml/artifacts/."""
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = ARTIFACTS_DIR / artifact_name

    X_train = generate_synthetic_training_data()
    detector = FinancialAnomalyDetector(contamination=0.03, n_estimators=150)
    detector.fit(X_train)

    joblib.dump(detector, out_path)
    print(f"Successfully trained and saved model to: {out_path}")
    return out_path

if __name__ == "__main__":
    train_and_export_model()
