"""Batch training script for FinControl Machine Learning Models."""

import sys
from pathlib import Path

FINCONTROL_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(FINCONTROL_ROOT))

from ml.training.train_anomaly_detector import train_and_export_model

def main():
    print("Starting ML Model Retraining Pipeline...")
    model_path = train_and_export_model("isolation_forest_v1.joblib")
    print(f"[SUCCESS] Model artifact ready at: {model_path}")

if __name__ == "__main__":
    main()
