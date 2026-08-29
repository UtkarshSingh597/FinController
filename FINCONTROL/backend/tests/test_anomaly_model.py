from decimal import Decimal

from app.ml.anomaly import detect_payment_amount_anomalies


def test_isolation_forest_flags_extreme_payment_amount() -> None:
    results = detect_payment_amount_anomalies([Decimal("100")] * 20 + [Decimal("10000")])

    assert results[-1].is_anomaly
    assert results[-1].explanation_features["payment_amount"] == 10000.0
