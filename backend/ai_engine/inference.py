"""
AI Inference Service for Emergency Response Platform.
Uses models in backend/ai_models/ (from train_model.py) with heuristics for classification tasks.
"""

import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODELS_DIR = Path(__file__).resolve().parent.parent / "ai_models"

FEATURE_DEFAULTS = {
    "rainfall": 45.0,
    "wind_speed": 28.0,
    "humidity": 72.0,
    "rainfall_72h_mm": 120.0,
    "elevation_m": 250.0,
    "slope_deg": 8.0,
    "builtup_pct": 35.0,
    "water_pct": 12.0,
    "forest_pct": 18.0,
    "population": 85000,
    "population_density": 420.0,
    "vulnerability_score": 0.55,
    "hospital_count": 3,
    "shelter_center_count": 5,
    "ambulance_count": 8,
    "nearest_depot_distance_km": 18.0,
    "nearest_hospital_distance_km": 12.0,
    "estimated_travel_time_minutes": 35.0,
    "road_blockage_probability": 0.25,
}


def _load(filename):
    path = MODELS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}. Run ai_engine/train_model.py first.")
    return joblib.load(path)


def _feature_columns():
    path = MODELS_DIR / "feature_columns.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return list(FEATURE_DEFAULTS.keys())


def _vectorize(feature_dict: dict) -> pd.DataFrame:
    cols = _feature_columns()
    row = {c: feature_dict.get(c, FEATURE_DEFAULTS.get(c, 0)) for c in cols}
    return pd.DataFrame([row])[cols]


def _text_blob(feature_dict: dict) -> str:
    parts = [
        feature_dict.get("description", ""),
        feature_dict.get("title", ""),
        feature_dict.get("text", ""),
    ]
    return " ".join(str(p) for p in parts if p).lower()


def _heuristic_disaster_type(feature_dict: dict) -> dict:
    text = _text_blob(feature_dict)
    rules = [
        (r"earthquake|seismic|tremor", "earthquake"),
        (r"cyclone|storm surge|hurricane", "cyclone"),
        (r"wildfire|forest fire|blaze", "wildfire"),
        (r"landslide|mudslide|debris flow", "landslide"),
        (r"drought|water scarcity", "drought"),
        (r"tsunami", "tsunami"),
        (r"heatwave|heat wave", "heatwave"),
        (r"chemical|industrial|gas leak", "industrial"),
        (r"flood|inundation|water level|dam breach", "flood"),
    ]
    predicted = "other"
    for pattern, dtype in rules:
        if re.search(pattern, text):
            predicted = dtype
            break

    if predicted == "other":
        rainfall = float(feature_dict.get("rainfall", FEATURE_DEFAULTS["rainfall"]))
        wind = float(feature_dict.get("wind_speed", FEATURE_DEFAULTS["wind_speed"]))
        if rainfall > 80:
            predicted = "flood"
        elif wind > 60:
            predicted = "cyclone"

    types = [
        "flood", "earthquake", "cyclone", "wildfire", "landslide",
        "drought", "tsunami", "heatwave", "industrial", "other",
    ]
    probs = {t: 0.05 for t in types}
    probs[predicted] = 0.55
    remainder = 1.0 - probs[predicted]
    others = [t for t in types if t != predicted]
    for t in others:
        probs[t] = round(remainder / len(others), 4)

    return {"predicted_type": predicted, "probabilities": probs}


def predict_disaster_type(feature_dict: dict) -> dict:
    classifier = MODELS_DIR / "disaster_type_classifier.joblib"
    if classifier.exists():
        model = _load("disaster_type_classifier.joblib")
        le = _load("disaster_type_label_encoder.joblib")
        with open(MODELS_DIR / "model_metadata.json", encoding="utf-8") as f:
            meta = json.load(f)
        df = pd.DataFrame([feature_dict])[meta["all_features"]]
        pred_idx = model.predict(df)[0]
        probs = model.predict_proba(df)[0]
        return {
            "predicted_type": le.inverse_transform([pred_idx])[0],
            "probabilities": {
                cls: round(float(prob), 4) for cls, prob in zip(le.classes_, probs)
            },
        }
    return _heuristic_disaster_type(feature_dict)


def predict_alert_level(feature_dict: dict) -> dict:
    classifier = MODELS_DIR / "alert_level_classifier.joblib"
    if classifier.exists():
        model = _load("alert_level_classifier.joblib")
        le = _load("alert_level_label_encoder.joblib")
        with open(MODELS_DIR / "model_metadata.json", encoding="utf-8") as f:
            meta = json.load(f)
        df = pd.DataFrame([feature_dict])[meta["all_features"]]
        pred_idx = model.predict(df)[0]
        probs = model.predict_proba(df)[0]
        return {
            "alert_level": le.inverse_transform([pred_idx])[0],
            "confidence": round(float(max(probs)), 4),
            "probabilities": {
                cls: round(float(prob), 4) for cls, prob in zip(le.classes_, probs)
            },
        }

    risk = predict_risk_score(feature_dict)["risk_score"]
    if risk >= 0.75:
        level = "Red"
    elif risk >= 0.45:
        level = "Orange"
    else:
        level = "Green"
    return {
        "alert_level": level,
        "confidence": round(min(0.95, 0.5 + abs(risk - 0.5)), 4),
        "probabilities": {"Green": 0.1, "Orange": 0.3, "Red": 0.6} if level == "Red" else {},
    }


def predict_risk_score(feature_dict: dict) -> dict:
    if (MODELS_DIR / "disaster_risk_model.pkl").exists():
        model = _load("disaster_risk_model.pkl")
        score = float(model.predict(_vectorize(feature_dict))[0])
    elif (MODELS_DIR / "risk_score_predictor.joblib").exists():
        model = _load("risk_score_predictor.joblib")
        with open(MODELS_DIR / "model_metadata.json", encoding="utf-8") as f:
            meta = json.load(f)
        df = pd.DataFrame([feature_dict])[meta["all_features"]]
        score = float(model.predict(df)[0])
    else:
        rainfall = float(feature_dict.get("rainfall", FEATURE_DEFAULTS["rainfall"]))
        density = float(feature_dict.get("population_density", FEATURE_DEFAULTS["population_density"]))
        score = min(1.0, (rainfall / 150.0) * 0.4 + (density / 1000.0) * 0.3 + 0.15)

    score = max(0.0, min(1.0, score))
    risk_label = (
        "Critical" if score >= 0.75 else
        "High" if score >= 0.5 else
        "Medium" if score >= 0.25 else
        "Low"
    )
    return {"risk_score": round(score, 4), "risk_label": risk_label}


def predict_priority_score(feature_dict: dict) -> dict:
    if (MODELS_DIR / "priority_score_predictor.joblib").exists():
        model = _load("priority_score_predictor.joblib")
        with open(MODELS_DIR / "model_metadata.json", encoding="utf-8") as f:
            meta = json.load(f)
        df = pd.DataFrame([feature_dict])[meta["all_features"]]
        score = float(model.predict(df)[0])
    else:
        trapped = float(feature_dict.get("people_trapped", 0))
        severity = float(feature_dict.get("severity", 3))
        risk = predict_risk_score(feature_dict)["risk_score"]
        score = min(1.0, risk * 0.5 + (severity / 5.0) * 0.3 + min(trapped, 20) / 20.0 * 0.2)

    return {
        "priority_score": round(score, 4),
        "triage_level": (
            "P1 - Immediate" if score >= 0.75 else
            "P2 - Urgent" if score >= 0.5 else
            "P3 - Delayed" if score >= 0.25 else
            "P4 - Minimal"
        ),
    }


def predict_resource_demand(feature_dict: dict) -> dict:
    if (MODELS_DIR / "resource_demand_forecaster.joblib").exists():
        model = _load("resource_demand_forecaster.joblib")
        target_cols = _load("resource_demand_target_columns.joblib")
        with open(MODELS_DIR / "model_metadata.json", encoding="utf-8") as f:
            meta = json.load(f)
        df = pd.DataFrame([feature_dict])[meta["all_features"]]
        preds = model.predict(df)[0]
        return {col: max(0, round(float(val), 1)) for col, val in zip(target_cols, preds)}

    risk = predict_risk_score(feature_dict)["risk_score"]
    pop = float(feature_dict.get("affected_population", feature_dict.get("population", 5000)))
    teams = float(feature_dict.get("rescue_team_demand", 0))

    if (MODELS_DIR / "rescue_demand_model.pkl").exists():
        model = _load("rescue_demand_model.pkl")
        teams = float(model.predict(_vectorize(feature_dict))[0])

    return {
        "rescue_team_demand": max(1, round(teams, 1)),
        "food_demand": max(100, round(pop * 0.15 * risk, 0)),
        "water_demand_litres": max(500, round(pop * 3 * risk, 0)),
        "medical_kit_demand": max(10, round(pop * 0.002 * risk, 0)),
    }


def predict_response_time(feature_dict: dict) -> dict:
    if (MODELS_DIR / "response_time_estimator.joblib").exists():
        model = _load("response_time_estimator.joblib")
        with open(MODELS_DIR / "model_metadata.json", encoding="utf-8") as f:
            meta = json.load(f)
        df = pd.DataFrame([feature_dict])[meta["all_features"]]
        minutes = float(model.predict(df)[0])
    else:
        minutes = float(feature_dict.get(
            "estimated_travel_time_minutes",
            FEATURE_DEFAULTS["estimated_travel_time_minutes"],
        ))
        blockage = float(feature_dict.get("road_blockage_probability", 0))
        depot_km = float(feature_dict.get("nearest_depot_distance_km", 18))
        minutes = minutes + depot_km * 2.5 + blockage * 45

    minutes = max(5, minutes)
    return {
        "estimated_response_time_minutes": round(minutes, 1),
        "estimated_response_time_hours": round(minutes / 60, 2),
    }


def full_triage_report(feature_dict: dict) -> dict:
    return {
        "disaster_prediction": predict_disaster_type(feature_dict),
        "alert_level": predict_alert_level(feature_dict),
        "risk_assessment": predict_risk_score(feature_dict),
        "triage_priority": predict_priority_score(feature_dict),
        "resource_demand": predict_resource_demand(feature_dict),
        "response_time": predict_response_time(feature_dict),
    }
