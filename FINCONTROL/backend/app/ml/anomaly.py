from dataclasses import dataclass
from decimal import Decimal

import numpy as np
from sklearn.ensemble import IsolationForest


@dataclass(frozen=True)
class AnomalyResult:
    anomaly_score: Decimal
    is_anomaly: bool
    explanation_features: dict[str, float]


def detect_payment_amount_anomalies(
    amounts: list[Decimal], *, seed: int = 20260823
) -> list[AnomalyResult]:
    """Score payment amounts with Isolation Forest; requires enough history to be meaningful."""
    if len(amounts) < 8:
        raise ValueError("At least eight payment observations are required for anomaly detection.")
    features = np.array([[float(amount)] for amount in amounts])
    model = IsolationForest(contamination="auto", random_state=seed, n_estimators=200)
    predictions = model.fit_predict(features)
    raw_scores = -model.score_samples(features)
    return [
        AnomalyResult(
            anomaly_score=Decimal(str(round(float(score), 5))),
            is_anomaly=prediction == -1,
            explanation_features={"payment_amount": float(amount)},
        )
        for amount, prediction, score in zip(amounts, predictions, raw_scores, strict=True)
    ]
