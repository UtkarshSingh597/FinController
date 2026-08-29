import os
import pickle
from pathlib import Path
from typing import Any

from sklearn.ensemble import IsolationForest

MODEL_DIR = Path(os.getenv("FINCONTROL_MODEL_DIR", "models_cache"))


def get_model_path(model_name: str, version: str = "v1") -> Path:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    return MODEL_DIR / f"{model_name}_{version}.pkl"


def save_model(model: Any, model_name: str, version: str = "v1") -> Path:
    """Serialize model artifact to disk."""
    path = get_model_path(model_name, version)
    with open(path, "wb") as f:
        pickle.dump(model, f)
    return path


def load_model(model_name: str, version: str = "v1") -> Any | None:
    """Load serialized model artifact if available."""
    path = get_model_path(model_name, version)
    if not path.exists():
        return None
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except Exception:
        return None


def get_or_fit_anomaly_model(
    features: list[list[float]],
    *,
    model_name: str = "payment_isolation_forest",
    version: str = "v1",
    seed: int = 20260823,
) -> IsolationForest:
    """Retrieve existing fitted model or fit and save a new Isolation Forest."""
    model = load_model(model_name, version)
    if model is not None:
        return model

    new_model = IsolationForest(contamination="auto", random_state=seed, n_estimators=200)
    new_model.fit(features)
    save_model(new_model, model_name, version)
    return new_model
