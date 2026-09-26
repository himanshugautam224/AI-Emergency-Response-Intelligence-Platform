"""USGS Earthquake ingestion client."""
import requests
from typing import Any, Dict, List
from ingestion.base.connector import BaseConnector

USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

class USGSClient(BaseConnector):
    source_name = "USGS_Earthquake"

    def fetch(self, period: str = "week", min_magnitude: float = 3.0) -> List[Dict[str, Any]]:
        params = {
            "format": "geojson",
            "starttime": f"-{7 if period == 'week' else 30}",
            "minmagnitude": min_magnitude,
            "maxlatitude": 35.5, "minlatitude": 8.0,
            "maxlongitude": 97.5, "minlongitude": 68.0,
        }
        try:
            r = requests.get(USGS_URL, params=params, timeout=15)
            r.raise_for_status()
            features = r.json().get("features", [])
            return [self._normalize(f) for f in features]
        except Exception as e:
            return []

    def _normalize(self, feature: dict) -> dict:
        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [None, None, None])
        return {
            "id": feature.get("id"),
            "magnitude": props.get("mag"),
            "place": props.get("place", ""),
            "time": props.get("time"),
            "latitude": coords[1],
            "longitude": coords[0],
            "depth_km": coords[2],
            "url": props.get("url", ""),
            "source": "USGS",
        }

    def validate(self, record: dict) -> bool:
        return (record.get("magnitude") is not None and
                record.get("latitude") is not None and
                record.get("longitude") is not None)


def fetch_earthquakes(period: str = "week", min_mag: float = 3.0) -> List[Dict]:
    return USGSClient().run(period=period, min_magnitude=min_mag)
