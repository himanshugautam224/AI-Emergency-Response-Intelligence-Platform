"""
ML Risk Prediction — Inference
Loads trained models and makes predictions.
"""
import os
import pickle
import json
import numpy as np
from pathlib import Path

MODELS_DIR = Path("ml/models")

_risk_model = None
_impact_model = None
_stats = None


def _load_risk_model():
    global _risk_model
    if _risk_model is None:
        path = MODELS_DIR / "risk_classifier.pkl"
        if path.exists():
            with open(path, "rb") as f:
                _risk_model = pickle.load(f)
    return _risk_model


def _load_impact_model():
    global _impact_model
    if _impact_model is None:
        path = MODELS_DIR / "impact_regressor.pkl"
        if path.exists():
            with open(path, "rb") as f:
                _impact_model = pickle.load(f)
    return _impact_model


def _load_stats():
    global _stats
    if _stats is None:
        path = MODELS_DIR / "dataset_stats.json"
        if path.exists():
            with open(path) as f:
                _stats = json.load(f)
    return _stats


RISK_SCORE_MAP = {"low": 0.2, "medium": 0.5, "high": 0.75, "critical": 0.95}
RESOURCE_MAP = {
    "low": 50, "medium": 200, "high": 800, "critical": 2500
}


def predict_risk(features: dict) -> dict:
    """
    Predict risk level and impact for a disaster event.
    
    Args:
        features: dict with keys: disaster_type, affected_population,
                  latitude, longitude, rainfall_mm, wind_speed, magnitude
    Returns:
        dict with risk_score, risk_level, predicted_impact, resources_needed, confidence
    """
    artifacts = _load_risk_model()
    if artifacts is None:
        return _fallback_predict(features)

    try:
        model = artifacts["model"]
        scaler = artifacts["scaler"]
        le_type = artifacts["le_type"]
        le_country = artifacts["le_country"]
        le_risk = artifacts["le_risk"]

        disaster_type = features.get("disaster_type", "unknown").lower()
        if disaster_type not in le_type.classes_:
            disaster_type = "flood" if "flood" in disaster_type else le_type.classes_[0]

        country = "India"
        if country not in le_country.classes_:
            country = le_country.classes_[0]

        affected = features.get("affected_population", 10000)
        damage = features.get("damage_usd", 0)
        lat = features.get("latitude", 20.59)
        lon = features.get("longitude", 78.96)

        X = np.array([[
            le_type.transform([disaster_type])[0],
            le_country.transform([country])[0],
            np.log1p(affected),
            np.log1p(damage),
            lat,
            lon,
            2020,  # decade placeholder
        ]])
        X_s = scaler.transform(X)

        pred_class = model.predict(X_s)[0]
        pred_proba = model.predict_proba(X_s)[0]
        risk_level = le_risk.inverse_transform([pred_class])[0]
        confidence = float(max(pred_proba))

        risk_score = RISK_SCORE_MAP.get(risk_level, 0.5)
        resources_needed = RESOURCE_MAP.get(risk_level, 200)

        # Adjust resources by population
        pop_factor = min(affected / 10000, 10)
        resources_needed = int(resources_needed * max(1, pop_factor))

        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 3),
            "predicted_impact": round(affected * risk_score * 0.3),
            "resources_needed": resources_needed,
            "confidence": round(confidence, 3),
            "model": "GradientBoostingClassifier v1.0",
        }
    except Exception as e:
        return _fallback_predict(features)


def _fallback_predict(features: dict) -> dict:
    """Rule-based fallback when ML model is not trained."""
    affected = features.get("affected_population", 10000)
    disaster_type = features.get("disaster_type", "unknown").lower()

    base_risk = {
        "earthquake": 0.85, "tsunami": 0.9, "cyclone": 0.8,
        "flood": 0.65, "drought": 0.5, "wildfire": 0.7,
        "landslide": 0.75, "storm": 0.6, "unknown": 0.4,
    }.get(disaster_type, 0.5)

    # Scale by population
    pop_multiplier = min(np.log1p(affected) / np.log1p(100000), 1.5)
    risk_score = min(base_risk * pop_multiplier, 1.0)

    if risk_score >= 0.8:
        risk_level = "critical"
    elif risk_score >= 0.6:
        risk_level = "high"
    elif risk_score >= 0.4:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 3),
        "predicted_impact": int(affected * risk_score * 0.3),
        "resources_needed": RESOURCE_MAP.get(risk_level, 200),
        "confidence": 0.72,
        "model": "rule_based_fallback",
        "note": "Train ML model: python -m ml.risk_prediction.train",
    }


def get_risk_summary() -> dict:
    stats = _load_stats()
    if not stats:
        return {"message": "Run training first: python -m ml.risk_prediction.train"}

    return {
        "total_events_analyzed": stats["total_records"],
        "year_range": stats["year_range"],
        "top_disaster_types": dict(list(stats["disaster_types"].items())[:10]),
        "risk_distribution": stats["risk_distribution"],
        "total_deaths_historical": stats["total_deaths"],
        "total_affected_historical": stats["total_affected"],
    }


def get_heatmap_data() -> list:
    """Return risk heatmap points for map overlay."""
    # High-risk zones in India based on historical data
    return [
        {"lat": 22.5, "lon": 88.3, "intensity": 0.9, "label": "West Bengal"},
        {"lat": 20.9, "lon": 85.1, "intensity": 0.85, "label": "Odisha"},
        {"lat": 15.3, "lon": 75.7, "intensity": 0.7, "label": "Karnataka"},
        {"lat": 26.8, "lon": 80.9, "intensity": 0.75, "label": "Uttar Pradesh"},
        {"lat": 28.7, "lon": 77.1, "intensity": 0.6, "label": "Delhi NCR"},
        {"lat": 30.7, "lon": 76.7, "intensity": 0.65, "label": "Himachal Pradesh"},
        {"lat": 17.4, "lon": 78.4, "intensity": 0.7, "label": "Telangana"},
        {"lat": 9.9, "lon": 78.1, "intensity": 0.75, "label": "Tamil Nadu"},
        {"lat": 23.3, "lon": 85.3, "intensity": 0.8, "label": "Jharkhand"},
        {"lat": 25.1, "lon": 85.3, "intensity": 0.78, "label": "Bihar"},
        {"lat": 11.1, "lon": 76.0, "intensity": 0.72, "label": "Kerala"},
        {"lat": 32.7, "lon": 74.8, "intensity": 0.85, "label": "Jammu & Kashmir"},
    ]
