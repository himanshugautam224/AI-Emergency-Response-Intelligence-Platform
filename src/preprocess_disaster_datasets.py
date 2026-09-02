from pathlib import Path
import pandas as pd
import numpy as np


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# INPUT FILES
# ============================================================

CLIMATE_FILE = RAW_DIR / "climate.csv"
CYCLONE_FILE = RAW_DIR / "cyclone.csv"
HISTORICAL_FILE = RAW_DIR / "historical_disasters.csv"
EARTHQUAKE_FILE = RAW_DIR / "earthquakes.csv"


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def find_column(df, candidates):
    """
    Return the first matching column from candidates.
    Matching is case-insensitive and ignores spaces/underscores.
    """
    normalized = {
        str(col).strip().lower().replace(" ", "_"): col
        for col in df.columns
    }

    for candidate in candidates:
        key = candidate.strip().lower().replace(" ", "_")
        if key in normalized:
            return normalized[key]

    return None


def clean_numeric(series):
    return pd.to_numeric(series, errors="coerce")


# ============================================================
# LOAD DATASETS
# ============================================================

print("=" * 70)
print("DISASTER DATA PREPROCESSING")
print("=" * 70)

print("\nLoading datasets...")

for file_path in [
    CLIMATE_FILE,
    CYCLONE_FILE,
    HISTORICAL_FILE,
    EARTHQUAKE_FILE,
]:
    if not file_path.exists():
        raise FileNotFoundError(
            f"\nDataset not found:\n{file_path}\n\n"
            "Check that the file exists inside data/raw/"
        )

climate = pd.read_csv(CLIMATE_FILE)
cyclone = pd.read_csv(CYCLONE_FILE)
historical = pd.read_csv(HISTORICAL_FILE)
earthquake = pd.read_csv(EARTHQUAKE_FILE)

print(f"Climate/Flood dataset: {climate.shape}")
print(f"Cyclone dataset:       {cyclone.shape}")
print(f"Historical dataset:    {historical.shape}")
print(f"Earthquake dataset:    {earthquake.shape}")


# ============================================================
# 1. CLIMATE / FLOOD RISK DATA
# ============================================================

print("\nProcessing climate/flood-risk dataset...")

climate_clean = climate.copy()

climate_clean.columns = [
    str(col).strip().lower().replace(" ", "_")
    for col in climate_clean.columns
]

# Convert numeric-looking columns
for col in climate_clean.columns:
    converted = pd.to_numeric(climate_clean[col], errors="coerce")

    if converted.notna().sum() > 0:
        climate_clean[col] = converted

climate_output = PROCESSED_DIR / "clean_climate_flood.csv"
climate_clean.to_csv(climate_output, index=False)

print(f"Saved: {climate_output}")


# ============================================================
# 2. CYCLONE TRACK DATA
# ============================================================

print("\nProcessing cyclone track dataset...")

cyclone_clean = cyclone.copy()

cyclone_clean.columns = [
    str(col).strip()
    for col in cyclone_clean.columns
]

# Remove possible units/header row.
# The first row of this dataset contains values such as:
# Year, degrees_north, kts, mb, etc.
if len(cyclone_clean) > 0:
    first_row_text = " ".join(
        cyclone_clean.iloc[0].astype(str).tolist()
    ).lower()

    if (
        "degree" in first_row_text
        or "kts" in first_row_text
        or "mb" in first_row_text
    ):
        cyclone_clean = cyclone_clean.iloc[1:].copy()

# Find important columns
sid_col = find_column(cyclone_clean, ["SID", "sid"])
season_col = find_column(cyclone_clean, ["SEASON", "season"])
lat_col = find_column(cyclone_clean, ["LAT", "latitude"])
lon_col = find_column(cyclone_clean, ["LON", "longitude"])
wind_col = find_column(cyclone_clean, ["USA_WIND", "wind", "max_wind"])
pressure_col = find_column(
    cyclone_clean,
    ["USA_PRES", "pressure", "min_pressure"]
)
sshs_col = find_column(
    cyclone_clean,
    ["USA_SSHS", "SSHS"]
)

# Convert numeric columns
for col in [season_col, lat_col, lon_col, wind_col, pressure_col, sshs_col]:
    if col is not None:
        cyclone_clean[col] = pd.to_numeric(
            cyclone_clean[col],
            errors="coerce"
        )

# Save cleaned track-level dataset
cyclone_tracks_output = PROCESSED_DIR / "clean_cyclone_tracks.csv"
cyclone_clean.to_csv(cyclone_tracks_output, index=False)

print(f"Saved: {cyclone_tracks_output}")


# ============================================================
# 3. AGGREGATE CYCLONE TRACKS INTO EVENTS
# ============================================================

print("\nCreating cyclone event dataset...")

if sid_col is None:
    raise ValueError(
        "Could not find SID column in cyclone dataset."
    )

# Remove rows without storm ID
cyclone_clean = cyclone_clean[
    cyclone_clean[sid_col].notna()
].copy()

# ------------------------------------------------------------
# Determine aggregation columns
# ------------------------------------------------------------

aggregation = {}

if season_col is not None:
    aggregation[season_col] = "first"

if lat_col is not None:
    aggregation[lat_col] = "mean"

if lon_col is not None:
    aggregation[lon_col] = "mean"

if wind_col is not None:
    aggregation[wind_col] = "max"

if pressure_col is not None:
    aggregation[pressure_col] = "min"

if sshs_col is not None:
    aggregation[sshs_col] = "max"

if not aggregation:
    raise ValueError(
        "No cyclone columns available for event aggregation."
    )

# ------------------------------------------------------------
# Group track points by cyclone/storm ID
# ------------------------------------------------------------

cyclone_events = (
    cyclone_clean
    .groupby(sid_col, as_index=False)
    .agg(aggregation)
)

# ------------------------------------------------------------
# Rename columns safely
# ------------------------------------------------------------

rename_map = {
    sid_col: "event_id",
}

if season_col is not None and season_col in cyclone_events.columns:
    rename_map[season_col] = "event_year"

if lat_col is not None and lat_col in cyclone_events.columns:
    rename_map[lat_col] = "latitude"

if lon_col is not None and lon_col in cyclone_events.columns:
    rename_map[lon_col] = "longitude"

if wind_col is not None and wind_col in cyclone_events.columns:
    rename_map[wind_col] = "magnitude"

if pressure_col is not None and pressure_col in cyclone_events.columns:
    rename_map[pressure_col] = "minimum_pressure"

if sshs_col is not None and sshs_col in cyclone_events.columns:
    rename_map[sshs_col] = "sshs"

cyclone_events = cyclone_events.rename(
    columns=rename_map
)

# ------------------------------------------------------------
# Guarantee required columns exist
# ------------------------------------------------------------

if "event_year" not in cyclone_events.columns:
    cyclone_events["event_year"] = np.nan

if "latitude" not in cyclone_events.columns:
    cyclone_events["latitude"] = np.nan

if "longitude" not in cyclone_events.columns:
    cyclone_events["longitude"] = np.nan

if "magnitude" not in cyclone_events.columns:
    cyclone_events["magnitude"] = np.nan

# ------------------------------------------------------------
# Create event metadata
# ------------------------------------------------------------

cyclone_events["disaster_type"] = "Cyclone"

cyclone_events["disaster_subtype"] = "Tropical Cyclone"

cyclone_events["location"] = (
    cyclone_events.apply(
        lambda row: (
            f"{row['latitude']:.4f}, {row['longitude']:.4f}"
            if pd.notna(row["latitude"])
            and pd.notna(row["longitude"])
            else None
        ),
        axis=1
    )
)

# ------------------------------------------------------------
# Create event date
# ------------------------------------------------------------

cyclone_events["event_year"] = pd.to_numeric(
    cyclone_events["event_year"],
    errors="coerce"
)

cyclone_events["event_date"] = pd.to_datetime(
    cyclone_events["event_year"],
    format="%Y",
    errors="coerce"
)

# ------------------------------------------------------------
# Impact fields are not available in cyclone track data
# ------------------------------------------------------------

cyclone_events["deaths"] = np.nan
cyclone_events["affected_population"] = np.nan
cyclone_events["damage_000_usd"] = np.nan

cyclone_events["source_dataset"] = "cyclone_tracks"

# ------------------------------------------------------------
# Save aggregated cyclone events
# ------------------------------------------------------------

cyclone_events_output = (
    PROCESSED_DIR / "cyclone_events.csv"
)

cyclone_events.to_csv(
    cyclone_events_output,
    index=False
)

print(f"Saved: {cyclone_events_output}")
print(f"Cyclone events: {len(cyclone_events)}")


# ============================================================
# 4. HISTORICAL INDIA DISASTER DATA
# ============================================================

print("\nProcessing historical India disaster dataset...")

historical_clean = historical.copy()

historical_clean.columns = [
    str(col).strip()
    for col in historical_clean.columns
]

# Identify columns
historical_id = find_column(
    historical_clean,
    ["disaster_id", "id", "event_id"]
)

historical_date = find_column(
    historical_clean,
    ["event_date", "date", "start_date"]
)

historical_type = find_column(
    historical_clean,
    ["disaster_type", "type"]
)

historical_subtype = find_column(
    historical_clean,
    ["disaster_subtype", "subtype"]
)

historical_lat = find_column(
    historical_clean,
    ["latitude", "lat"]
)

historical_lon = find_column(
    historical_clean,
    ["longitude", "lon", "lng"]
)

historical_location = find_column(
    historical_clean,
    ["location", "place", "district", "state"]
)

historical_deaths = find_column(
    historical_clean,
    ["total_deaths", "deaths", "death"]
)

historical_affected = find_column(
    historical_clean,
    ["total_affected", "affected_population", "affected"]
)

historical_damage = find_column(
    historical_clean,
    ["total_damage_000_usd", "damage_000_usd", "damage"]
)

# Numeric conversions
for col in [
    historical_lat,
    historical_lon,
    historical_deaths,
    historical_affected,
    historical_damage,
]:
    if col:
        historical_clean[col] = pd.to_numeric(
            historical_clean[col],
            errors="coerce"
        )

if historical_date:
    historical_clean[historical_date] = pd.to_datetime(
        historical_clean[historical_date],
        errors="coerce"
    )

# Build event table
historical_events = pd.DataFrame({
    "event_id": (
        historical_clean[historical_id]
        if historical_id
        else historical_clean.index.astype(str)
    ),

    "event_date": (
        historical_clean[historical_date]
        if historical_date
        else pd.NaT
    ),

    "disaster_type": (
        historical_clean[historical_type]
        if historical_type
        else "Unknown"
    ),

    "disaster_subtype": (
        historical_clean[historical_subtype]
        if historical_subtype
        else None
    ),

    "latitude": (
        historical_clean[historical_lat]
        if historical_lat
        else np.nan
    ),

    "longitude": (
        historical_clean[historical_lon]
        if historical_lon
        else np.nan
    ),

    "location": (
        historical_clean[historical_location]
        if historical_location
        else None
    ),

    "magnitude": np.nan,

    "deaths": (
        historical_clean[historical_deaths]
        if historical_deaths
        else np.nan
    ),

    "affected_population": (
        historical_clean[historical_affected]
        if historical_affected
        else np.nan
    ),

    "damage_000_usd": (
        historical_clean[historical_damage]
        if historical_damage
        else np.nan
    ),

    "source_dataset": "historical_india"
})

historical_output = (
    PROCESSED_DIR / "clean_historical_disasters.csv"
)

historical_clean.to_csv(
    historical_output,
    index=False
)

print(f"Saved: {historical_output}")
print(f"Historical events: {len(historical_events)}")


# ============================================================
# 5. EARTHQUAKE DATA
# ============================================================

print("\nProcessing earthquake dataset...")

earthquake_clean = earthquake.copy()

earthquake_clean.columns = [
    str(col).strip()
    for col in earthquake_clean.columns
]

eq_id = find_column(
    earthquake_clean,
    ["id", "event_id"]
)

eq_time = find_column(
    earthquake_clean,
    ["TIME", "time", "date"]
)

eq_lat = find_column(
    earthquake_clean,
    ["LATITUDE", "latitude", "lat"]
)

eq_lon = find_column(
    earthquake_clean,
    ["LONGITUDE", "longitude", "lon"]
)

eq_mag = find_column(
    earthquake_clean,
    ["MAGNITUDE", "magnitude", "mag"]
)

eq_depth = find_column(
    earthquake_clean,
    ["DEPTH", "depth"]
)

eq_place = find_column(
    earthquake_clean,
    ["PLACE", "place", "location"]
)

for col in [eq_lat, eq_lon, eq_mag, eq_depth]:
    if col:
        earthquake_clean[col] = pd.to_numeric(
            earthquake_clean[col],
            errors="coerce"
        )

if eq_time:
    earthquake_clean[eq_time] = pd.to_datetime(
        earthquake_clean[eq_time],
        errors="coerce"
    )

earthquake_events = pd.DataFrame({
    "event_id": (
        earthquake_clean[eq_id]
        if eq_id
        else earthquake_clean.index.astype(str)
    ),

    "event_date": (
        earthquake_clean[eq_time]
        if eq_time
        else pd.NaT
    ),

    "disaster_type": "Earthquake",

    "disaster_subtype": "Earthquake",

    "latitude": (
        earthquake_clean[eq_lat]
        if eq_lat
        else np.nan
    ),

    "longitude": (
        earthquake_clean[eq_lon]
        if eq_lon
        else np.nan
    ),

    "location": (
        earthquake_clean[eq_place]
        if eq_place
        else None
    ),

    "magnitude": (
        earthquake_clean[eq_mag]
        if eq_mag
        else np.nan
    ),

    "deaths": np.nan,

    "affected_population": np.nan,

    "damage_000_usd": np.nan,

    "source_dataset": "earthquakes"
})

earthquake_output = (
    PROCESSED_DIR / "clean_earthquakes.csv"
)

earthquake_clean.to_csv(
    earthquake_output,
    index=False
)

print(f"Saved: {earthquake_output}")
print(f"Earthquake events: {len(earthquake_events)}")


# ============================================================
# 6. CREATE UNIFIED EVENT DATASET
# ============================================================

print("\nCreating unified disaster event dataset...")

# Keep only common event-level columns
common_columns = [
    "event_id",
    "event_date",
    "disaster_type",
    "disaster_subtype",
    "latitude",
    "longitude",
    "location",
    "magnitude",
    "deaths",
    "affected_population",
    "damage_000_usd",
    "source_dataset",
]

historical_events = historical_events[common_columns]
earthquake_events = earthquake_events[common_columns]
cyclone_event_data = cyclone_events[common_columns]


# Combine event-level datasets
disaster_events = pd.concat(
    [
        historical_events,
        earthquake_events,
        cyclone_event_data,
    ],
    ignore_index=True
)


# Standardize dates
disaster_events["event_date"] = pd.to_datetime(
    disaster_events["event_date"],
    errors="coerce"
)


# Standardize coordinates
disaster_events["latitude"] = pd.to_numeric(
    disaster_events["latitude"],
    errors="coerce"
)

disaster_events["longitude"] = pd.to_numeric(
    disaster_events["longitude"],
    errors="coerce"
)


# Remove impossible coordinates
disaster_events.loc[
    ~disaster_events["latitude"].between(-90, 90),
    "latitude"
] = np.nan

disaster_events.loc[
    ~disaster_events["longitude"].between(-180, 180),
    "longitude"
] = np.nan


# Remove exact duplicates
disaster_events = disaster_events.drop_duplicates(
    subset=[
        "event_id",
        "disaster_type",
        "source_dataset",
    ]
)


# Add date features
disaster_events["event_year"] = (
    disaster_events["event_date"].dt.year
)

disaster_events["event_month"] = (
    disaster_events["event_date"].dt.month
)


# Sort
disaster_events = disaster_events.sort_values(
    by="event_date",
    na_position="last"
).reset_index(drop=True)


# ============================================================
# 7. SAVE FINAL DATASET
# ============================================================

unified_output = (
    PROCESSED_DIR / "disaster_events_unified.csv"
)

disaster_events.to_csv(
    unified_output,
    index=False
)


# ============================================================
# 8. VALIDATION
# ============================================================

print("\n" + "=" * 70)
print("PREPROCESSING COMPLETE")
print("=" * 70)

print(f"\nUnified dataset:")
print(f"Rows:    {len(disaster_events)}")
print(f"Columns: {len(disaster_events.columns)}")

print("\nDisaster type distribution:")

print(
    disaster_events["disaster_type"]
    .value_counts(dropna=False)
)

print("\nMissing values:")

print(
    disaster_events.isna()
    .sum()
    .sort_values(ascending=False)
)

print(f"\nFinal file:")
print(unified_output)

print("\nProcessed files:")
for file in sorted(PROCESSED_DIR.glob("*.csv")):
    print(f"  - {file.name}")

print("\nDone.")