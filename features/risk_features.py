"""Feature engineering — risk features from disaster event data."""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional


DISASTER_TYPE_RISK = {
    "flood": 0.82, "cyclone": 0.91, "earthquake": 0.88,
    "landslide": 0.74, "drought": 0.51, "heatwave": 0.58,
    "tsunami": 0.95, "fire": 0.65, "storm": 0.72, "unknown": 0.50,
}

HIGH_RISK_STATES = {
    "Odisha": 0.90, "Assam": 0.87, "Uttarakhand": 0.83,
    "Kerala": 0.80, "Maharashtra": 0.75, "Gujarat": 0.72,
    "Himachal Pradesh": 0.70, "West Bengal": 0.76, "Bihar": 0.74,
}


def compute_risk_score(
    disaster_type: str,
    affected_population: int,
    state: str = "",
    latitude: float = 20.5937,
    longitude: float = 78.9629,
    rainfall_mm: float = 0.0,
    wind_speed: float = 0.0,
    magnitude: float = 0.0,
) -> Dict[str, Any]:
    """Compute composite risk score for a disaster event."""
    base_risk = DISASTER_TYPE_RISK.get(disaster_type.lower(), 0.5)
    state_risk = HIGH_RISK_STATES.get(state, 0.65)

    # Population factor (log-scaled, max contribution 0.2)
    pop_factor = min(np.log1p(affected_population) / np.log1p(1_000_000), 1.0) * 0.2

    # Intensity factor
    if disaster_type.lower() in ("flood", "cyclone"):
        intensity = min(rainfall_mm / 300.0, 1.0) * 0.15 + min(wind_speed / 200.0, 1.0) * 0.15
    elif disaster_type.lower() == "earthquake":
        intensity = min(max(magnitude - 4.0, 0) / 5.0, 1.0) * 0.30
    else:
        intensity = 0.10

    risk_score = round(
        base_risk * 0.35 + state_risk * 0.30 + pop_factor + intensity,
        4
    )
    risk_score = min(risk_score, 1.0)

    return {
        "risk_score": risk_score,
        "base_type_risk": base_risk,
        "state_vulnerability": state_risk,
        "population_factor": round(pop_factor, 4),
        "intensity_factor": round(intensity, 4),
        "risk_level": (
            "CRITICAL" if risk_score >= 0.80 else
            "HIGH" if risk_score >= 0.60 else
            "MEDIUM" if risk_score >= 0.40 else "LOW"
        ),
    }


def compute_impact_features(record: Dict[str, Any]) -> Dict[str, Any]:
    """Estimate disaster impact features."""
    pop = record.get("affected_population", 0)
    risk = record.get("risk_score", 0.5)
    return {
        "estimated_displaced": int(pop * risk * 0.3),
        "estimated_casualties_range": f"{int(pop * risk * 0.001)}–{int(pop * risk * 0.005)}",
        "infrastructure_damage_index": round(risk * 0.9, 3),
        "economic_loss_cr_inr": round(pop * risk * 0.0005, 2),
    }


def compute_resource_features(risk_score: float, affected_population: int) -> Dict[str, Any]:
    """Calculate resource requirements based on risk and population."""
    scale = affected_population / 10_000
    return {
        "rescue_teams_needed": max(1, int(scale * risk_score * 5)),
        "medical_units_needed": max(1, int(scale * risk_score * 3)),
        "relief_kits_needed": max(100, int(affected_population * risk_score * 0.15)),
        "helicopters_needed": max(0, int(scale * risk_score * 1)),
        "boats_needed": max(0, int(scale * risk_score * 2)),
    }
