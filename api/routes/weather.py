"""
Real weather data via Open-Meteo (free, no API key) + USGS earthquakes + NASA EONET.
All data is 100% real — no mock/random fallbacks.
"""
import asyncio
import httpx
import math
from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

USGS_URL    = "https://earthquake.usgs.gov/fdsnws/event/1/query"
NASA_EONET  = "https://eonet.gsfc.nasa.gov/api/v3"
OPEN_METEO  = "https://api.open-meteo.com/v1/forecast"
NOMINATIM   = "https://nominatim.openstreetmap.org/reverse"

# WMO weather code → human-readable description
WMO_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}

def _wmo_to_icon(code: int) -> str:
    if code == 0: return "☀️"
    if code in (1, 2): return "🌤️"
    if code == 3: return "☁️"
    if code in (45, 48): return "🌫️"
    if code in (51, 53, 55, 61, 63, 65, 80, 81, 82): return "🌧️"
    if code in (71, 73, 75, 77, 85, 86): return "🌨️"
    if code in (95, 96, 99): return "⛈️"
    return "🌡️"

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/current")
async def get_weather(lat: float = Query(20.5937), lon: float = Query(78.9629)):
    """
    Real-time weather from Open-Meteo (free, no API key).
    Also reverse geocodes the coordinates via Nominatim.
    """
    async with httpx.AsyncClient(timeout=12.0, headers={"User-Agent": "ERIP-India/1.0"}) as client:
        # Fetch weather and reverse geocode in parallel
        try:
            weather_resp, geo_resp = await asyncio.gather(
                client.get(OPEN_METEO, params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure",
                    "wind_speed_unit": "kmh",
                    "timezone": "Asia/Kolkata",
                    "forecast_days": 1,
                }),
                client.get(NOMINATIM, params={
                    "lat": lat, "lon": lon,
                    "format": "json", "zoom": 10,
                }),
            )
            weather_resp.raise_for_status()
            data = weather_resp.json()
            cur = data["current"]

            # Reverse geocode
            location_name = "Your Location"
            try:
                geo = geo_resp.json()
                addr = geo.get("address", {})
                parts = [
                    addr.get("suburb") or addr.get("neighbourhood"),
                    addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county"),
                    addr.get("state"),
                ]
                location_name = ", ".join(p for p in parts if p) or geo.get("display_name", "Your Location").split(",")[0]
            except Exception:
                pass

            code = cur.get("weather_code", 0)
            return {
                "temperature":       round(cur["temperature_2m"], 1),
                "feels_like":        round(cur["apparent_temperature"], 1),
                "humidity":          cur["relative_humidity_2m"],
                "pressure":          round(cur["surface_pressure"], 1),
                "wind_speed":        round(cur["wind_speed_10m"], 1),
                "wind_direction":    cur["wind_direction_10m"],
                "precipitation":     cur["precipitation"],
                "weather_code":      code,
                "description":       WMO_CODES.get(code, "Unknown"),
                "icon":              _wmo_to_icon(code),
                "city":              location_name,
                "latitude":          lat,
                "longitude":         lon,
                "source":            "Open-Meteo (real-time)",
                "updated_at":        cur.get("time", ""),
            }

        except Exception as e:
            # Return error — NO random mock data
            return {
                "error": True,
                "message": f"Weather unavailable: {str(e)}",
                "city": "Location unavailable",
                "source": "Open-Meteo",
            }


@router.get("/forecast")
async def get_forecast(lat: float = Query(20.5937), lon: float = Query(78.9629), days: int = Query(7)):
    """Real 7-day hourly forecast from Open-Meteo."""
    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            resp = await client.get(OPEN_METEO, params={
                "latitude": lat, "longitude": lon,
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
                "timezone": "Asia/Kolkata",
                "forecast_days": min(days, 16),
            })
            resp.raise_for_status()
            data = resp.json()
            daily = data.get("daily", {})
            dates = daily.get("time", [])
            return [
                {
                    "date":         dates[i],
                    "temp_max":     daily["temperature_2m_max"][i],
                    "temp_min":     daily["temperature_2m_min"][i],
                    "precipitation": daily["precipitation_sum"][i],
                    "weather_code": daily["weather_code"][i],
                    "description":  WMO_CODES.get(daily["weather_code"][i], ""),
                    "icon":         _wmo_to_icon(daily["weather_code"][i]),
                    "wind_max":     daily["wind_speed_10m_max"][i],
                }
                for i in range(len(dates))
            ]
        except Exception as e:
            return {"error": True, "message": str(e)}


@router.get("/earthquakes")
async def get_earthquakes(
    lat:           float = Query(20.5937, description="User latitude"),
    lon:           float = Query(78.9629, description="User longitude"),
    radius_km:     int   = Query(1000),
    min_magnitude: float = Query(2.5),
    period:        str   = Query("week"),
):
    """
    Real USGS earthquakes filtered to within radius_km of user location.
    No mock data — returns empty list if USGS is unreachable.
    """
    days = 30 if period == "month" else 7
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Use USGS FDSN API with bounding box around user location
            lat_offset = radius_km / 111.0
            lon_offset = radius_km / (111.0 * abs(math.cos(math.radians(lat))) + 0.001)

            days = 30 if period == "month" else 7
            start_time = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")
            resp = await client.get(USGS_URL, params={
                "format":       "geojson",
                "minlatitude":  lat - lat_offset,
                "maxlatitude":  lat + lat_offset,
                "minlongitude": lon - lon_offset,
                "maxlongitude": lon + lon_offset,
                "minmagnitude": min_magnitude,
                "orderby":      "time",
                "limit":        100,
                "starttime":    start_time,
            })
            resp.raise_for_status()
            features = resp.json().get("features", [])

            results = []
            for f in features:
                props = f["properties"]
                coords = f["geometry"]["coordinates"]
                eq_lat, eq_lon = coords[1], coords[0]
                dist = _haversine_km(lat, lon, eq_lat, eq_lon)
                if dist <= radius_km and props.get("mag", 0) >= min_magnitude:
                    results.append({
                        "id":        f["id"],
                        "magnitude": props["mag"],
                        "place":     props["place"],
                        "time":      props["time"],
                        "latitude":  eq_lat,
                        "longitude": eq_lon,
                        "depth_km":  coords[2],
                        "distance_km": round(dist, 1),
                        "url":       props.get("url", ""),
                        "alert":     props.get("alert"),
                        "tsunami":   props.get("tsunami", 0),
                        "source":    "USGS (real-time)",
                    })

            return sorted(results, key=lambda x: x["time"], reverse=True)

        except Exception as e:
            return {"error": True, "message": str(e), "data": []}


@router.get("/nasa-events")
async def get_nasa_events(
    lat:       Optional[float] = Query(None),
    lon:       Optional[float] = Query(None),
    radius_km: int             = Query(2000),
):
    """NASA EONET real open natural events, optionally filtered near user."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(
                f"{NASA_EONET}/events",
                params={"status": "open", "limit": 50, "days": 30},
            )
            resp.raise_for_status()
            events = resp.json().get("events", [])

            results = []
            for e in events:
                geom = e.get("geometry", [])
                if not geom:
                    continue
                last = geom[-1]
                coords = last.get("coordinates")
                if not coords:
                    continue
                ev_lon, ev_lat = coords[0], coords[1]

                # Distance filter if user location provided
                dist = None
                if lat is not None and lon is not None:
                    dist = _haversine_km(lat, lon, ev_lat, ev_lon)
                    if dist > radius_km:
                        continue

                results.append({
                    "id":          e["id"],
                    "title":       e["title"],
                    "categories":  [c["title"] for c in e.get("categories", [])],
                    "latitude":    ev_lat,
                    "longitude":   ev_lon,
                    "date":        last.get("date"),
                    "distance_km": round(dist, 1) if dist is not None else None,
                    "source":      "NASA EONET (real-time)",
                    "link":        e.get("link", ""),
                })

            return sorted(results, key=lambda x: x.get("date") or "", reverse=True)

        except Exception as e:
            return {"error": True, "message": str(e), "data": []}

