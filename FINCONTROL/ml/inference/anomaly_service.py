"""High-Performance Inference Service for Anomaly Scoring."""

import joblib
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np

from ..models.isolation_forest import FinancialAnomalyDetector, AnomalyScoreResult
from ..preprocessing.feature_pipeline import batch_extract_features, extract_transaction_features

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "artifacts"
DEFAULT_MODEL_PATH = ARTIFACTS_DIR / "isolation_forest_v1.joblib"

class AnomalyInferenceService:
    """Production service for scoring real-time financial telemetry."""

    def __init__(self, model_path: Optional[Path] = None) -> None:
        self.model_path = model_path or DEFAULT_MODEL_PATH
        self.model: Optional[FinancialAnomalyDetector] = None
        self._load_model()

    def _load_model(self) -> None:
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)
        else:
            # Fallback inline instantiation
            self.model = FinancialAnomalyDetector()

    def score_transactions(self, transactions: List[Dict[str, Any]]) -> List[AnomalyScoreResult]:
        """Extract features and score batch of transactions."""
        if not self.model or not getattr(self.model, "is_fitted", False):
            # Auto-fit fallback if model not loaded from file
            from ..training.train_anomaly_detector import generate_synthetic_training_data
            self.model = FinancialAnomalyDetector()
            self.model.fit(generate_synthetic_training_data(500))

        X = batch_extract_features(transactions)
        return self.model.score(X)
