"""Isolation Forest Model Implementation with Feature Contribution Attribution."""

from dataclasses import dataclass
from typing import Any, Dict, List, Tuple
import numpy as np
from sklearn.ensemble import IsolationForest

from ..preprocessing.feature_pipeline import FEATURE_NAMES

@dataclass(frozen=True)
class AnomalyScoreResult:
    anomaly_score: float
    is_anomaly: bool
    severity: str
    feature_attributions: Dict[str, float]

class FinancialAnomalyDetector:
    """Enterprise Isolation Forest detector for multi-tenant financial telemetry."""

    def __init__(
        self,
        contamination: float = 0.05,
        n_estimators: int = 150,
        random_state: int = 42,
    ) -> None:
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            random_state=self.random_state,
        )
        self.is_fitted = False

    def fit(self, X: np.ndarray) -> "FinancialAnomalyDetector":
        """Fit the Isolation Forest model on historical feature matrix."""
        self.model.fit(X)
        self.is_fitted = True
        return self

    def score(self, X: np.ndarray) -> List[AnomalyScoreResult]:
        """Compute calibrated anomaly scores (0.000 to 1.000) and feature contributions."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted yet.")

        raw_scores = -self.model.score_samples(X)  # higher = more anomalous
        predictions = self.model.predict(X)         # -1 = anomaly, 1 = normal

        results = []
        for i, (score, pred) in enumerate(zip(raw_scores, predictions)):
            # Normalize score to approx 0.0 - 1.0 range
            calibrated_score = float(np.clip((score - 0.4) / 0.4, 0.0, 1.0))
            is_anomaly = (pred == -1) or (calibrated_score >= 0.70)
            
            severity = "NORMAL"
            if calibrated_score >= 0.85:
                severity = "CRITICAL"
            elif calibrated_score >= 0.70:
                severity = "ELEVATED"
            elif calibrated_score >= 0.50:
                severity = "MODERATE"

            # Compute rough feature contribution proxy
            sample = X[i]
            attributions = {}
            for feat_idx, feat_name in enumerate(FEATURE_NAMES):
                attributions[feat_name] = round(float(abs(sample[feat_idx])) / (float(np.sum(np.abs(sample))) + 1e-6), 3)

            results.append(
                AnomalyScoreResult(
                    anomaly_score=round(calibrated_score, 4),
                    is_anomaly=is_anomaly,
                    severity=severity,
                    feature_attributions=attributions,
                )
            )
        return results
