"""
ERIP India — AI Emergency Response Intelligence Platform
Configuration Settings
"""
import os
from pathlib import Path

# ─── Base Paths ───────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/disaster_platform.db")
# For production: postgresql+psycopg2://user:pass@host:5432/erip

# ─── External API Keys ────────────────────────────────────────────────────────
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"

# ─── Clerk Auth ───────────────────────────────────────────────────────────────
CLERK_PUBLISHABLE_KEY = os.getenv("VITE_CLERK_PUBLISHABLE_KEY", "")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# ─── ML Model Settings ────────────────────────────────────────────────────────
RISK_MODEL_PATH = BASE_DIR / "ml" / "models" / "risk_model.pkl"
IMPACT_MODEL_PATH = BASE_DIR / "ml" / "models" / "impact_model.pkl"
RESOURCE_MODEL_PATH = BASE_DIR / "ml" / "models" / "resource_model.pkl"

# ─── Data Paths ───────────────────────────────────────────────────────────────
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
CURATED_DIR = DATA_DIR / "curated"

# ─── Ingestion Settings ───────────────────────────────────────────────────────
EARTHQUAKE_LOOKBACK_DAYS = 7
WEATHER_UPDATE_INTERVAL_MIN = 15
