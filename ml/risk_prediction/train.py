"""
ML Risk Prediction — Training Script
Trains a risk prediction model using the historical disaster dataset.
Usage: python -m ml.risk_prediction.train
"""
import os
import sys
import pickle
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error
from pathlib import Path

DATASET_PATH = os.getenv("DATASET_PATH", "disaster_Dataset_FINAL.csv")
MODELS_DIR = Path("ml/models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

DISASTER_TYPE_MAP = {
    "flood": "flood", "floods": "flood", "flooding": "flood",
    "earthquake": "earthquake", "earthquakes": "earthquake",
    "cyclone": "cyclone", "hurricane": "cyclone", "typhoon": "cyclone",
    "drought": "drought", "wildfire": "wildfire", "fire": "wildfire",
    "landslide": "landslide", "tsunami": "tsunami",
    "storm": "storm", "hailstorm": "storm",
}

def normalize_disaster_type(t: str) -> str:
    if pd.isna(t):
        return "unknown"
    t = str(t).lower().strip()
    for k, v in DISASTER_TYPE_MAP.items():
        if k in t:
            return v
    return t


def load_and_preprocess(path: str) -> pd.DataFrame:
    print(f"[TRAIN] Loading dataset: {path}")
    df = pd.read_csv(path, low_memory=False)
    print(f"[TRAIN] Loaded {len(df):,} rows, {len(df.columns)} columns")

    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]

    # Find key columns (flexible naming)
    col_map = {}
    for col in df.columns:
        if "disaster" in col and "type" in col:
            col_map["disaster_type"] = col
        elif "death" in col or "kill" in col or "fatali" in col:
            col_map["deaths"] = col
        elif "affect" in col and col_map.get("affected") is None:
            col_map["affected"] = col
        elif "damage" in col and ("usd" in col or "000" in col or "mill" in col):
            col_map["damage"] = col
        elif "year" in col:
            col_map["year"] = col
        elif "country" in col:
            col_map["country"] = col
        elif "lat" in col and "lon" not in col:
            col_map["latitude"] = col
        elif "lon" in col or "long" in col:
            col_map["longitude"] = col

    print(f"[TRAIN] Column mapping: {col_map}")

    # Build clean dataframe
    clean = pd.DataFrame()
    clean["disaster_type"] = df[col_map.get("disaster_type", df.columns[0])].apply(normalize_disaster_type)
    clean["year"] = pd.to_numeric(df.get(col_map.get("year", "year"), 2000), errors="coerce").fillna(2000)
    clean["deaths"] = pd.to_numeric(df.get(col_map.get("deaths", "deaths"), 0), errors="coerce").fillna(0)
    clean["affected"] = pd.to_numeric(df.get(col_map.get("affected", "affected"), 0), errors="coerce").fillna(0)
    clean["damage_usd"] = pd.to_numeric(df.get(col_map.get("damage", "damage"), 0), errors="coerce").fillna(0)
    clean["country"] = df.get(col_map.get("country", "country"), "Unknown").fillna("Unknown")
    clean["latitude"] = pd.to_numeric(df.get(col_map.get("latitude", "latitude"), 20.59), errors="coerce").fillna(20.59)
    clean["longitude"] = pd.to_numeric(df.get(col_map.get("longitude", "longitude"), 78.96), errors="coerce").fillna(78.96)

    # Derived features
    clean["log_affected"] = np.log1p(clean["affected"])
    clean["log_deaths"] = np.log1p(clean["deaths"])
    clean["log_damage"] = np.log1p(clean["damage_usd"])
    clean["decade"] = ((clean["year"] - 1900) // 10) * 10

    # Risk level classification
    def classify_risk(row):
        if row["deaths"] > 1000 or row["affected"] > 1_000_000:
            return "critical"
        elif row["deaths"] > 100 or row["affected"] > 100_000:
            return "high"
        elif row["deaths"] > 10 or row["affected"] > 10_000:
            return "medium"
        else:
            return "low"

    clean["risk_level"] = clean.apply(classify_risk, axis=1)
    return clean.dropna(subset=["disaster_type"])


def train_risk_classifier(df: pd.DataFrame):
    print("[TRAIN] Training risk level classifier...")

    le_type = LabelEncoder()
    le_country = LabelEncoder()
    le_risk = LabelEncoder()

    df["type_enc"] = le_type.fit_transform(df["disaster_type"])
    df["country_enc"] = le_country.fit_transform(df["country"])

    features = ["type_enc", "country_enc", "log_affected", "log_damage", "latitude", "longitude", "decade"]
    X = df[features].fillna(0)
    y = le_risk.fit_transform(df["risk_level"])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    model = GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=42)
    model.fit(X_train_s, y_train)

    y_pred = model.predict(X_test_s)
    print("[TRAIN] Risk Classifier Report:")
    print(classification_report(y_test, y_pred, target_names=le_risk.classes_))

    # Save artifacts
    with open(MODELS_DIR / "risk_classifier.pkl", "wb") as f:
        pickle.dump({"model": model, "scaler": scaler, "le_type": le_type,
                     "le_country": le_country, "le_risk": le_risk,
                     "feature_names": features}, f)

    print("[TRAIN] Saved: ml/models/risk_classifier.pkl")
    return model, scaler, le_type, le_country, le_risk


def train_impact_regressor(df: pd.DataFrame):
    print("[TRAIN] Training impact (deaths) regressor...")

    le_type = LabelEncoder()
    df["type_enc"] = le_type.fit_transform(df["disaster_type"])

    features = ["type_enc", "log_affected", "log_damage", "latitude", "longitude", "decade"]
    X = df[features].fillna(0)
    y = df["log_deaths"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"[TRAIN] Impact Regressor MAE: {mae:.4f} (log deaths)")

    with open(MODELS_DIR / "impact_regressor.pkl", "wb") as f:
        pickle.dump({"model": model, "le_type": le_type, "feature_names": features}, f)

    print("[TRAIN] Saved: ml/models/impact_regressor.pkl")
    return model


def compute_stats(df: pd.DataFrame):
    """Compute and save dataset statistics for the frontend."""
    stats = {
        "total_records": len(df),
        "year_range": [int(df["year"].min()), int(df["year"].max())],
        "disaster_types": df["disaster_type"].value_counts().to_dict(),
        "risk_distribution": df["risk_level"].value_counts().to_dict(),
        "top_countries": df["country"].value_counts().head(20).to_dict(),
        "total_deaths": int(df["deaths"].sum()),
        "total_affected": int(df["affected"].sum()),
        "avg_deaths_per_event": float(df["deaths"].mean()),
    }
    import json
    with open(MODELS_DIR / "dataset_stats.json", "w") as f:
        json.dump(stats, f, indent=2)
    print("[TRAIN] Saved: ml/models/dataset_stats.json")
    return stats


if __name__ == "__main__":
    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset not found: {DATASET_PATH}")
        sys.exit(1)

    df = load_and_preprocess(DATASET_PATH)
    train_risk_classifier(df)
    train_impact_regressor(df)
    stats = compute_stats(df)
    print(f"\n[TRAIN] Training complete!")
    print(f"  Records: {stats['total_records']:,}")
    print(f"  Years: {stats['year_range'][0]}–{stats['year_range'][1]}")
    print(f"  Types: {list(stats['disaster_types'].keys())[:5]}")
    print(f"\n  Models saved to: ml/models/")
