"""
Database seeder — loads disaster_Dataset_FINAL.csv into the database
and creates sample incidents and resources.

Usage: python -m database.seed
"""
import os
import sys
import uuid
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from database.connection import init_db, get_db_session
from database.models.disaster import DisasterEvent
from database.models.incident import Incident
from database.models.resource import Resource


DATASET_PATH = os.getenv("DATASET_PATH", "disaster_Dataset_FINAL.csv")

INDIAN_LOCATIONS = [
    ("Mumbai", "Maharashtra", 19.076, 72.877),
    ("Chennai", "Tamil Nadu", 13.083, 80.270),
    ("Kolkata", "West Bengal", 22.572, 88.364),
    ("Bhubaneswar", "Odisha", 20.296, 85.825),
    ("Patna", "Bihar", 25.594, 85.137),
    ("Guwahati", "Assam", 26.144, 91.736),
    ("Dehradun", "Uttarakhand", 30.316, 78.032),
    ("Jaipur", "Rajasthan", 26.912, 75.787),
    ("Vijayawada", "Andhra Pradesh", 16.506, 80.647),
    ("Kochi", "Kerala", 9.931, 76.267),
    ("Srinagar", "J&K", 34.083, 74.797),
    ("Imphal", "Manipur", 24.817, 93.950),
    ("Thiruvananthapuram", "Kerala", 8.524, 76.936),
    ("Varanasi", "Uttar Pradesh", 25.317, 82.973),
    ("Ranchi", "Jharkhand", 23.344, 85.310),
]

DISASTER_TYPES = ["flood", "earthquake", "cyclone", "drought", "wildfire", "landslide", "storm"]
ALERT_LEVELS = ["low", "medium", "high", "critical"]
STATUSES = ["active", "responding", "resolved"]

RESOURCE_TEMPLATES = [
    ("NDRF Team Alpha", "personnel", "Search & Rescue"),
    ("NDRF Team Beta", "personnel", "Search & Rescue"),
    ("Medical Unit 1", "medical", "Emergency Medical"),
    ("Medical Unit 2", "medical", "Emergency Medical"),
    ("Rescue Boat Squad A", "vehicle", "Water Rescue"),
    ("Rescue Boat Squad B", "vehicle", "Water Rescue"),
    ("Helicopter Unit 1", "vehicle", "Air Rescue"),
    ("Fire Brigade Unit 1", "vehicle", "Fire Fighting"),
    ("Relief Truck Fleet A", "vehicle", "Relief Distribution"),
    ("Water Purification Unit", "equipment", "Water Treatment"),
    ("Power Generator Set", "equipment", "Power Backup"),
    ("Ambulance Unit 1", "vehicle", "Medical Transport"),
    ("Ambulance Unit 2", "vehicle", "Medical Transport"),
    ("Tent Relief Camp Kit", "equipment", "Shelter"),
    ("Food Relief Squad", "personnel", "Relief Distribution"),
    ("Communication Unit", "equipment", "Communications"),
    ("Blood Bank Mobile", "medical", "Blood Supply"),
    ("Engineering Task Force", "personnel", "Infrastructure"),
    ("Drone Survey Unit", "equipment", "Aerial Survey"),
    ("Evacuation Bus Fleet", "vehicle", "Evacuation"),
]


def seed_historical_disasters(db, df: pd.DataFrame, limit: int = 5000):
    """Load historical disasters from CSV."""
    existing = db.query(DisasterEvent).count()
    if existing > 0:
        print(f"[SEED] Historical disasters already seeded ({existing} records). Skipping.")
        return

    print(f"[SEED] Seeding historical disasters from CSV (up to {limit} records)...")
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]

    # Discover columns
    col_map = {}
    for col in df.columns:
        cl = col.lower()
        if "disaster" in cl and "type" in cl:
            col_map["type"] = col
        elif any(x in cl for x in ["event_name", "disaster_name", "name"]):
            col_map.setdefault("name", col)
        elif any(x in cl for x in ["death", "kill", "fatal"]):
            col_map.setdefault("deaths", col)
        elif "affect" in cl and col_map.get("affected") is None:
            col_map["affected"] = col
        elif "damage" in cl and col_map.get("damage") is None:
            col_map["damage"] = col
        elif "year" in cl:
            col_map.setdefault("year", col)
        elif "country" in cl:
            col_map.setdefault("country", col)
        elif "lat" in cl and "lon" not in cl:
            col_map.setdefault("lat", col)
        elif "lon" in cl or "long" in cl:
            col_map.setdefault("lon", col)
        elif "location" in cl or "region" in cl:
            col_map.setdefault("location", col)

    DTYPE_MAP = {
        "flood": "flood", "floods": "flood",
        "earthquake": "earthquake",
        "cyclone": "cyclone", "hurricane": "cyclone", "typhoon": "cyclone",
        "drought": "drought", "wildfire": "wildfire", "fire": "wildfire",
        "landslide": "landslide", "tsunami": "tsunami",
        "storm": "storm",
    }

    count = 0
    for _, row in df.head(limit).iterrows():
        try:
            dtype_raw = str(row.get(col_map.get("type", ""), "unknown")).lower().strip()
            dtype = next((v for k, v in DTYPE_MAP.items() if k in dtype_raw), dtype_raw)

            year = int(pd.to_numeric(row.get(col_map.get("year", ""), 2000), errors="coerce") or 2000)
            deaths = int(pd.to_numeric(row.get(col_map.get("deaths", ""), 0), errors="coerce") or 0)
            affected = int(pd.to_numeric(row.get(col_map.get("affected", ""), 0), errors="coerce") or 0)
            damage = float(pd.to_numeric(row.get(col_map.get("damage", ""), 0), errors="coerce") or 0.0)
            country = str(row.get(col_map.get("country", ""), "Unknown"))[:100]
            lat = float(pd.to_numeric(row.get(col_map.get("lat", ""), None), errors="coerce") or 0)
            lon = float(pd.to_numeric(row.get(col_map.get("lon", ""), None), errors="coerce") or 0)
            loc = str(row.get(col_map.get("location", ""), ""))[:255]

            if deaths > 1000000 or affected > 1_000_000_000:
                continue

            if deaths > 100000 or affected > 1000000 or damage > 1e9:
                severity = "catastrophic"
            elif deaths > 1000 or affected > 100000:
                severity = "major"
            elif deaths > 100 or affected > 10000:
                severity = "moderate"
            else:
                severity = "minor"

            event = DisasterEvent(
                id=str(uuid.uuid4()),
                name=str(row.get(col_map.get("name", col_map.get("type", "")), dtype)).strip()[:255] or f"{dtype.title()} Event {year}",
                disaster_type=dtype,
                severity=severity,
                latitude=lat if -90 <= lat <= 90 else None,
                longitude=lon if -180 <= lon <= 180 else None,
                location_name=loc,
                country=country,
                start_date=datetime(year, 1, 1),
                total_affected=affected,
                total_deaths=deaths,
                economic_damage_usd=damage,
                source="historical_dataset",
            )
            db.add(event)
            count += 1

            if count % 500 == 0:
                db.flush()
                print(f"[SEED]   {count} records inserted...")
        except Exception as e:
            continue

    db.commit()
    print(f"[SEED] Inserted {count} historical disaster records.")


def seed_sample_incidents(db):
    """Create realistic sample active incidents."""
    existing = db.query(Incident).count()
    if existing > 0:
        print(f"[SEED] Incidents already seeded ({existing} records). Skipping.")
        return

    print("[SEED] Creating sample incidents...")
    sample_incidents = [
        {
            "title": "Severe Flash Flood in West Bengal",
            "disaster_type": "flood", "alert_level": "critical", "status": "active",
            "latitude": 22.57, "longitude": 88.36, "location_name": "Kolkata",
            "district": "Kolkata", "state": "West Bengal",
            "affected_population": 125000, "casualties": 23, "injured": 187,
            "risk_score": 0.87, "predicted_impact": 37500, "resources_needed": 450, "confidence": 0.91,
        },
        {
            "title": "Earthquake - 5.8 Magnitude, Uttarakhand",
            "disaster_type": "earthquake", "alert_level": "high", "status": "responding",
            "latitude": 30.32, "longitude": 78.03, "location_name": "Dehradun",
            "district": "Dehradun", "state": "Uttarakhand",
            "affected_population": 45000, "casualties": 8, "injured": 92,
            "risk_score": 0.73, "predicted_impact": 13500, "resources_needed": 280, "confidence": 0.88,
        },
        {
            "title": "Cyclone Alert - Bay of Bengal",
            "disaster_type": "cyclone", "alert_level": "critical", "status": "active",
            "latitude": 13.08, "longitude": 80.27, "location_name": "Chennai",
            "district": "Chennai", "state": "Tamil Nadu",
            "affected_population": 380000, "casualties": 0, "injured": 15,
            "risk_score": 0.92, "predicted_impact": 114000, "resources_needed": 890, "confidence": 0.95,
        },
        {
            "title": "Drought Emergency - Rajasthan Districts",
            "disaster_type": "drought", "alert_level": "high", "status": "responding",
            "latitude": 26.91, "longitude": 75.78, "location_name": "Jaipur",
            "district": "Jaipur", "state": "Rajasthan",
            "affected_population": 2100000, "casualties": 3, "injured": 0,
            "risk_score": 0.68, "predicted_impact": 630000, "resources_needed": 1200, "confidence": 0.84,
        },
        {
            "title": "SOS - Village Cut Off by Floodwaters",
            "disaster_type": "flood", "alert_level": "critical", "status": "active",
            "latitude": 20.30, "longitude": 85.82, "location_name": "Bhubaneswar",
            "district": "Khordha", "state": "Odisha",
            "affected_population": 8500, "casualties": 4, "injured": 22, "is_sos": True,
            "risk_score": 0.81, "predicted_impact": 2550, "resources_needed": 150, "confidence": 0.89,
        },
        {
            "title": "Landslide - NH7 Highway Blocked",
            "disaster_type": "landslide", "alert_level": "medium", "status": "responding",
            "latitude": 30.32, "longitude": 79.45, "location_name": "Chamoli",
            "district": "Chamoli", "state": "Uttarakhand",
            "affected_population": 3200, "casualties": 2, "injured": 14,
            "risk_score": 0.61, "predicted_impact": 960, "resources_needed": 80, "confidence": 0.82,
        },
        {
            "title": "Wildfire Spreading in Forest Reserve",
            "disaster_type": "wildfire", "alert_level": "high", "status": "active",
            "latitude": 11.10, "longitude": 76.05, "location_name": "Ooty",
            "district": "Nilgiris", "state": "Tamil Nadu",
            "affected_population": 15000, "casualties": 0, "injured": 5,
            "risk_score": 0.69, "predicted_impact": 4500, "resources_needed": 120, "confidence": 0.86,
        },
        {
            "title": "Hailstorm Damage - Agricultural Crisis",
            "disaster_type": "storm", "alert_level": "medium", "status": "resolved",
            "latitude": 17.38, "longitude": 78.48, "location_name": "Hyderabad",
            "district": "Rangareddy", "state": "Telangana",
            "affected_population": 62000, "casualties": 1, "injured": 8,
            "risk_score": 0.42, "predicted_impact": 18600, "resources_needed": 95, "confidence": 0.78,
        },
    ]

    for data in sample_incidents:
        inc = Incident(id=str(uuid.uuid4()), created_at=datetime.utcnow(),
                       updated_at=datetime.utcnow(), **data)
        db.add(inc)

    db.commit()
    print(f"[SEED] Created {len(sample_incidents)} sample incidents.")


def seed_resources(db):
    """Create sample emergency response resources."""
    existing = db.query(Resource).count()
    if existing > 0:
        print(f"[SEED] Resources already seeded ({existing} records). Skipping.")
        return

    print("[SEED] Creating sample resources...")
    statuses = ["available", "available", "available", "deployed", "maintenance"]

    for name, rtype, category in RESOURCE_TEMPLATES:
        loc = random.choice(INDIAN_LOCATIONS)
        res = Resource(
            id=str(uuid.uuid4()),
            name=name,
            resource_type=rtype,
            category=category,
            quantity=random.randint(1, 10),
            unit="units",
            status=random.choice(statuses),
            latitude=loc[2] + random.uniform(-0.5, 0.5),
            longitude=loc[3] + random.uniform(-0.5, 0.5),
            location_name=loc[0],
            agency=random.choice(["NDRF", "State Disaster Authority", "Army", "Navy", "IAF", "Red Cross"]),
            is_critical=rtype in ["medical", "personnel"],
            created_at=datetime.utcnow(),
        )
        db.add(res)

    db.commit()
    print(f"[SEED] Created {len(RESOURCE_TEMPLATES)} resources.")


def run_seed():
    print("[SEED] Initializing database...")
    init_db()

    if os.path.exists(DATASET_PATH):
        df = pd.read_csv(DATASET_PATH, low_memory=False)
        with get_db_session() as db:
            seed_historical_disasters(db, df, limit=5000)
    else:
        print(f"[SEED] WARNING: Dataset not found at {DATASET_PATH} — skipping historical data")

    with get_db_session() as db:
        seed_sample_incidents(db)
        seed_resources(db)

    print("\n[SEED] Database seeded successfully!")


if __name__ == "__main__":
    run_seed()
