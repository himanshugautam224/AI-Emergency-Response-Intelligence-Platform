"""
ML Model Training Pipeline for Emergency Response Intelligence Platform.
Trains models on `disaster_Dataset_FINAL.csv`:
1. Disaster Risk & Severity Regressor (RandomForestRegressor)
2. Resource Demand Predictor (Food, Water, Rescue Teams)
Saves models to `backend/ai_models/`.
"""

import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR.parent / 'disaster_Dataset_FINAL.csv'
MODEL_DIR = BASE_DIR / 'ai_models'

def train_pipeline(sample_size=30000):
    print("=" * 60)
    print("AI EMERGENCY INTELLIGENCE PLATFORM — MODEL TRAINING")
    print("=" * 60)

    if not DATASET_PATH.exists():
        print(f"[ERROR] Dataset not found at {DATASET_PATH}")
        return False

    print(f"[1/4] Loading dataset: {DATASET_PATH} (sample: {sample_size} rows)...")
    df = pd.read_csv(DATASET_PATH, nrows=sample_size)
    print(f"      Loaded {df.shape[0]} rows, {df.shape[1]} features.")

    # Select Key Predictive Features
    feature_cols = [
        'rainfall', 'wind_speed', 'humidity', 'rainfall_72h_mm',
        'elevation_m', 'slope_deg', 'builtup_pct', 'water_pct', 'forest_pct',
        'population', 'population_density', 'vulnerability_score',
        'hospital_count', 'shelter_center_count', 'ambulance_count',
        'nearest_depot_distance_km', 'nearest_hospital_distance_km',
        'estimated_travel_time_minutes', 'road_blockage_probability'
    ]

    target_cols = {
        'risk_score': 'overall_disaster_risk_score',
        'severity_score': 'severity_score',
        'food_demand': 'food_demand',
        'water_demand': 'water_demand_litres',
        'rescue_teams': 'rescue_team_demand'
    }

    # Clean missing values
    available_features = [c for c in feature_cols if c in df.columns]
    X = df[available_features].fillna(df[available_features].median())

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    metrics_summary = {}

    print(f"[2/4] Training Disaster Risk Predictor...")
    if 'overall_disaster_risk_score' in df.columns:
        y_risk = df['overall_disaster_risk_score'].fillna(df['overall_disaster_risk_score'].median())
        X_train, X_test, y_train, y_test = train_test_split(X, y_risk, test_size=0.2, random_state=42)

        risk_model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
        risk_model.fit(X_train, y_train)

        preds = risk_model.predict(X_test)
        r2 = r2_score(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))

        joblib.dump(risk_model, MODEL_DIR / 'disaster_risk_model.pkl')
        metrics_summary['disaster_risk_model'] = {'r2_score': round(float(r2), 4), 'rmse': round(float(rmse), 4)}
        print(f"      Model saved: disaster_risk_model.pkl (R2: {r2:.4f}, RMSE: {rmse:.4f})")

    print(f"[3/4] Training Resource Allocation Demand Predictor...")
    if 'rescue_team_demand' in df.columns:
        y_rescue = df['rescue_team_demand'].fillna(df['rescue_team_demand'].median())
        X_train, X_test, y_train, y_test = train_test_split(X, y_rescue, test_size=0.2, random_state=42)

        demand_model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
        demand_model.fit(X_train, y_train)

        preds = demand_model.predict(X_test)
        r2 = r2_score(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))

        joblib.dump(demand_model, MODEL_DIR / 'rescue_demand_model.pkl')
        metrics_summary['rescue_demand_model'] = {'r2_score': round(float(r2), 4), 'rmse': round(float(rmse), 4)}
        print(f"      Model saved: rescue_demand_model.pkl (R2: {r2:.4f}, RMSE: {rmse:.4f})")

    # Save feature manifest and training metrics
    with open(MODEL_DIR / 'feature_columns.json', 'w') as f:
        json.dump(available_features, f, indent=2)

    with open(MODEL_DIR / 'model_metrics.json', 'w') as f:
        json.dump(metrics_summary, f, indent=2)

    print(f"[4/4] Pipeline Complete! Model artifacts stored in {MODEL_DIR}")
    return True

if __name__ == '__main__':
    train_pipeline(sample_size=30000)
