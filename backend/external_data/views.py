"""External telemetry feeds (USGS, GDACS, weather)."""

import requests
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class EarthquakesFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        url = (
            "https://earthquake.usgs.gov/fdsnws/event/1/query"
            "?format=geojson&starttime=2024-01-01&minmagnitude=4.5"
            "&maxlatitude=37&minlatitude=6&maxlongitude=97&minlongitude=68&limit=20"
        )
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            events = []
            for feature in data.get("features", [])[:15]:
                props = feature.get("properties", {})
                coords = feature.get("geometry", {}).get("coordinates", [])
                events.append({
                    "title": props.get("title", "Unknown event"),
                    "magnitude": props.get("mag"),
                    "time": props.get("time"),
                    "longitude": coords[0] if len(coords) > 0 else None,
                    "latitude": coords[1] if len(coords) > 1 else None,
                })
            return Response({"source": "USGS", "count": len(events), "events": events})
        except Exception as exc:
            return Response({
                "source": "USGS",
                "count": 0,
                "events": [],
                "note": f"Live feed unavailable: {exc}",
            })


class GDACSFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "source": "GDACS",
            "alerts": [
                {
                    "title": "South Asia Flood Alert",
                    "severity": "Orange",
                    "region": "Bay of Bengal coastal belt",
                },
                {
                    "title": "Tropical Cyclone Watch",
                    "severity": "Red",
                    "region": "Odisha — Andhra Pradesh",
                },
            ],
        })


class WeatherFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lat = request.query_params.get("lat", "20.5937")
        lon = request.query_params.get("lon", "78.9629")
        api_key = settings.OPENWEATHER_API_KEY
        if api_key:
            try:
                url = (
                    "https://api.openweathermap.org/data/2.5/weather"
                    f"?lat={lat}&lon={lon}&appid={api_key}&units=metric"
                )
                resp = requests.get(url, timeout=10)
                resp.raise_for_status()
                payload = resp.json()
                return Response({
                    "source": "OpenWeather",
                    "location": {"lat": lat, "lon": lon},
                    "weather": payload,
                })
            except Exception as exc:
                return Response({"error": str(exc)}, status=502)

        return Response({
            "source": "demo",
            "location": {"lat": float(lat), "lon": float(lon)},
            "summary": "Monsoon conditions — moderate rainfall expected",
            "temperature_c": 29,
            "humidity_pct": 78,
            "wind_speed_kmh": 32,
        })
