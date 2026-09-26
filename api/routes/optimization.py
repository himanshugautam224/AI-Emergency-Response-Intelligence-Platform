"""Resource optimization API route."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class OptimizationRequest(BaseModel):
    incident_id: str
    incident_type: str
    affected_population: int
    latitude: float
    longitude: float
    priority: str = "high"


@router.post("/allocate")
async def optimize_resource_allocation(request: OptimizationRequest):
    """
    Recommend optimal resource allocation for a given incident.
    Uses simple rule-based optimization (upgrades to LP solver in production).
    """
    from optimization.resource_allocation import allocate_resources
    return allocate_resources(request.model_dump())


@router.get("/routing")
async def optimize_routing(
    from_lat: float,
    from_lon: float,
    to_lat: float,
    to_lon: float,
):
    """Calculate optimal route between two points."""
    import math
    # Haversine distance
    R = 6371
    dlat = math.radians(to_lat - from_lat)
    dlon = math.radians(to_lon - from_lon)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(from_lat)) * math.cos(math.radians(to_lat)) * math.sin(dlon/2)**2
    distance_km = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    est_minutes = int(distance_km * 2.5)  # ~24 km/h average emergency speed

    return {
        "distance_km": round(distance_km, 2),
        "estimated_time_minutes": est_minutes,
        "from": {"lat": from_lat, "lon": from_lon},
        "to": {"lat": to_lat, "lon": to_lon},
    }
