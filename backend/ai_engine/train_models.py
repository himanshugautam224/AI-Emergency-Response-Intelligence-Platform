"""
=============================================================================
AI Emergency Response Platform â€” Model Training Pipeline
=============================================================================
Dataset: disaster_Dataset_FINAL.csv (~142 MB)

Models trained:
  1. Disaster Type Classifier      â†’ predicts disaster_type from features
  2. Severity/Risk Predictor       â†’ predicts overall_disaster_risk_score
  3. Alert Level Classifier        â†’ predicts alert_level (Green/Orange/Red)
  4. Resource Demand Forecaster    â†’ predicts food/water/medical demands
  5. Priority Score Predictor      â†’ predicts priority_score for triage
  6. Response Time Estimator       â†’ predicts response_time_minutes

All models are saved to: ai_models/ folder
=============================================================================
"""

import os
import warnings
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    classification_report, confusion_matrix,
    mean_squared_error, r2_score, accuracy_score
)

# Classifiers
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.multioutput import MultiOutputRegressor

warnings.filterwarnings('ignore')

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# CONFIGURATION
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# train_models.py lives at backend/ai_engine/ â†’ go up 3 levels to project root
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_PATH = PROJECT_ROOT / "disaster_Dataset_FINAL.csv"
MODELS_DIR = BACKEND_DIR / "ai_models"
MODELS_DIR.mkdir(exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.2

print("=" * 70)
print("  AI Emergency Response Platform â€” Model Training")
print("=" * 70)

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# STEP 1: LOAD DATA
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n[1/7] Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(f"  âœ“ Loaded {len(df):,} rows Ã— {len(df.columns)} columns")
print(f"  âœ“ Disaster types: {df['disaster_type'].unique()}")
print(f"  âœ“ Alert levels: {df['alert_level'].unique()}")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# STEP 2: DATA CLEANING & FEATURE SELECTION
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n[2/7] Cleaning data...")

# Core geospatial & environmental features (available before a disaster)
GEOSPATIAL_FEATURES = [
    'latitude', 'longitude', 'elevation_m', 'slope_deg',
    'rainfall', 'wind_speed', 'humidity', 'magnitude', 'depth',
]

# Population & vulnerability features
POPULATION_FEATURES = [
    'population_density', 'population', 'children_pct', 'elderly_pct',
    'medically_dependent_pct', 'disability_pct', 'vulnerability_score',
    'housing_risk_score',
]

# Infrastructure features
INFRASTRUCTURE_FEATURES = [
    'infrastructure_score', 'road_density', 'road_connectivity',
    'highway_distance', 'accessibility_score', 'building_count',
    'building_density_km2', 'road_length_km', 'bridge_count',
    'builtup_pct', 'water_pct', 'forest_pct', 'agriculture_pct',
]

# Emergency response capacity
CAPACITY_FEATURES = [
    'hospital_count', 'health_center_count', 'school_count',
    'police_station_count', 'fire_station_count', 'shelter_center_count',
    'ambulance_count', 'evacuation_center_count', 'relief_warehouse_count',
    'healthcare_capacity_index', 'emergency_response_capacity_index',
    'nearest_hospital_distance_km', 'nearest_evacuation_center_distance_km',
    'estimated_travel_time_minutes', 'logistics_accessibility_score',
]

# Depot / supply features
SUPPLY_FEATURES = [
    'food_packets_available', 'water_litres_available',
    'medical_kits_available', 'shelter_capacity',
    'rescue_vehicles_available', 'personnel_available',
]

ALL_FEATURES = (
    GEOSPATIAL_FEATURES + POPULATION_FEATURES +
    INFRASTRUCTURE_FEATURES + CAPACITY_FEATURES + SUPPLY_FEATURES
)

# Drop rows missing key target columns
df = df.dropna(subset=['disaster_type', 'severity_score', 'alert_level', 'priority_score'])
print(f"  âœ“ After cleaning: {len(df):,} rows")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# STEP 3: FEATURE PREPROCESSING PIPELINE
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n[3/7] Building preprocessing pipeline...")

X = df[ALL_FEATURES].copy()

# Fill numeric NaN with median
numeric_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
])

preprocessor = ColumnTransformer(transformers=[
    ('num', numeric_pipeline, ALL_FEATURES),
], remainder='drop')

print(f"  âœ“ Features: {len(ALL_FEATURES)} columns")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# HELPER FUNCTION
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def train_and_save_classifier(name, model, X_train, X_test, y_train, y_test, label_encoder=None):
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', model)
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    if label_encoder:
        y_test_dec = label_encoder.inverse_transform(y_test)
        y_pred_dec = label_encoder.inverse_transform(y_pred)
        acc = accuracy_score(y_test_dec, y_pred_dec)
        print(f"  âœ“ Accuracy: {acc:.4f}")
        print(classification_report(y_test_dec, y_pred_dec))
    else:
        acc = accuracy_score(y_test, y_pred)
        print(f"  âœ“ Accuracy: {acc:.4f}")
        print(classification_report(y_test, y_pred))

    model_path = MODELS_DIR / f"{name}.joblib"
    joblib.dump(pipeline, model_path)
    print(f"  âœ“ Saved â†’ {model_path}")
    return pipeline

def train_and_save_regressor(name, model, X_train, X_test, y_train, y_test):
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', model)
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"  âœ“ RMSE: {rmse:.4f}  |  RÂ²: {r2:.4f}")

    model_path = MODELS_DIR / f"{name}.joblib"
    joblib.dump(pipeline, model_path)
    print(f"  âœ“ Saved â†’ {model_path}")
    return pipeline


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# MODEL 1: DISASTER TYPE CLASSIFIER
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n" + "â”€" * 50)
print("[MODEL 1] Disaster Type Classifier")
print("â”€" * 50)

le_disaster = LabelEncoder()
y_disaster = le_disaster.fit_transform(df['disaster_type'])
X_train, X_test, y_train, y_test = train_test_split(X, y_disaster, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_disaster)

model1 = train_and_save_classifier(
    'disaster_type_classifier',
    RandomForestClassifier(n_estimators=200, max_depth=15, random_state=RANDOM_STATE, n_jobs=-1),
    X_train, X_test, y_train, y_test,
    label_encoder=le_disaster
)

# Save label encoder too
joblib.dump(le_disaster, MODELS_DIR / 'disaster_type_label_encoder.joblib')
print(f"  âœ“ Classes: {le_disaster.classes_}")


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# MODEL 2: ALERT LEVEL CLASSIFIER (Green / Orange / Red)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n" + "â”€" * 50)
print("[MODEL 2] Alert Level Classifier")
print("â”€" * 50)

le_alert = LabelEncoder()
y_alert = le_alert.fit_transform(df['alert_level'])
X_train, X_test, y_train, y_test = train_test_split(X, y_alert, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y_alert)

model2 = train_and_save_classifier(
    'alert_level_classifier',
    GradientBoostingClassifier(n_estimators=150, max_depth=6, learning_rate=0.1, random_state=RANDOM_STATE),
    X_train, X_test, y_train, y_test,
    label_encoder=le_alert
)

joblib.dump(le_alert, MODELS_DIR / 'alert_level_label_encoder.joblib')
print(f"  âœ“ Classes: {le_alert.classes_}")


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# MODEL 3: DISASTER RISK SCORE PREDICTOR (0.0 â€“ 1.0)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n" + "â”€" * 50)
print("[MODEL 3] Disaster Risk Score Predictor")
print("â”€" * 50)

y_risk = df['overall_disaster_risk_score'].fillna(df['overall_disaster_risk_score'].median())
X_train, X_test, y_train, y_test = train_test_split(X, y_risk, test_size=TEST_SIZE, random_state=RANDOM_STATE)

model3 = train_and_save_regressor(
    'risk_score_predictor',
    RandomForestRegressor(n_estimators=200, max_depth=15, random_state=RANDOM_STATE, n_jobs=-1),
    X_train, X_test, y_train, y_test
)


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# MODEL 4: PRIORITY SCORE PREDICTOR (for triage)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n" + "â”€" * 50)
print("[MODEL 4] Triage Priority Score Predictor")
print("â”€" * 50)

y_priority = df['priority_score'].fillna(df['priority_score'].median())
X_train, X_test, y_train, y_test = train_test_split(X, y_priority, test_size=TEST_SIZE, random_state=RANDOM_STATE)

model4 = train_and_save_regressor(
    'priority_score_predictor',
    GradientBoostingRegressor(n_estimators=150, max_depth=6, learning_rate=0.1, random_state=RANDOM_STATE),
    X_train, X_test, y_train, y_test
)


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# MODEL 5: RESOURCE DEMAND FORECASTER (multi-output)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n" + "â”€" * 50)
print("[MODEL 5] Resource Demand Forecaster (Multi-Output)")
print("â”€" * 50)

DEMAND_TARGETS = ['food_demand', 'water_demand_litres', 'medical_kit_demand', 'shelter_demand']
demand_cols = [c for c in DEMAND_TARGETS if c in df.columns]
y_demand = df[demand_cols].fillna(0)

X_train, X_test, y_train, y_test = train_test_split(X, y_demand, test_size=TEST_SIZE, random_state=RANDOM_STATE)

multi_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', MultiOutputRegressor(
        RandomForestRegressor(n_estimators=150, max_depth=12, random_state=RANDOM_STATE, n_jobs=-1)
    ))
])
multi_pipeline.fit(X_train, y_train)
y_pred = multi_pipeline.predict(X_test)

for i, col in enumerate(demand_cols):
    rmse = np.sqrt(mean_squared_error(y_test.iloc[:, i], y_pred[:, i]))
    r2 = r2_score(y_test.iloc[:, i], y_pred[:, i])
    print(f"  [{col}]  RMSE: {rmse:.2f}  |  RÂ²: {r2:.4f}")

joblib.dump(multi_pipeline, MODELS_DIR / 'resource_demand_forecaster.joblib')
joblib.dump(demand_cols, MODELS_DIR / 'resource_demand_target_columns.joblib')
print(f"  âœ“ Saved â†’ {MODELS_DIR / 'resource_demand_forecaster.joblib'}")


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# MODEL 6: RESPONSE TIME ESTIMATOR
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\n" + "â”€" * 50)
print("[MODEL 6] Response Time Estimator")
print("â”€" * 50)

y_response = df['response_time_minutes'].fillna(df['response_time_minutes'].median())
X_train, X_test, y_train, y_test = train_test_split(X, y_response, test_size=TEST_SIZE, random_state=RANDOM_STATE)

model6 = train_and_save_regressor(
    'response_time_estimator',
    GradientBoostingRegressor(n_estimators=150, max_depth=6, learning_rate=0.1, random_state=RANDOM_STATE),
    X_train, X_test, y_train, y_test
)


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# SAVE FEATURE METADATA (for inference)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import json

metadata = {
    "all_features": ALL_FEATURES,
    "geospatial_features": GEOSPATIAL_FEATURES,
    "population_features": POPULATION_FEATURES,
    "infrastructure_features": INFRASTRUCTURE_FEATURES,
    "capacity_features": CAPACITY_FEATURES,
    "supply_features": SUPPLY_FEATURES,
    "disaster_types": list(le_disaster.classes_),
    "alert_levels": list(le_alert.classes_),
    "demand_targets": demand_cols,
    "models": {
        "disaster_type_classifier": "disaster_type_classifier.joblib",
        "alert_level_classifier": "alert_level_classifier.joblib",
        "risk_score_predictor": "risk_score_predictor.joblib",
        "priority_score_predictor": "priority_score_predictor.joblib",
        "resource_demand_forecaster": "resource_demand_forecaster.joblib",
        "response_time_estimator": "response_time_estimator.joblib",
    }
}

with open(MODELS_DIR / "model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("\n" + "=" * 70)
print("  âœ…  ALL MODELS TRAINED AND SAVED SUCCESSFULLY")
print(f"  ðŸ“  Model directory: {MODELS_DIR}")
print("=" * 70)
print("\nModels saved:")
for name, path in metadata["models"].items():
    print(f"  â€¢ {name:40s} â†’ ai_models/{path}")

