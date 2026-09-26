"""Resource allocation optimization using rule-based + greedy algorithm."""
from typing import Dict, List, Any


RESOURCE_REQUIREMENTS = {
    "flood": {
        "rescue_boats": (2, 10),
        "ndrf_teams": (1, 5),
        "medical_units": (1, 4),
        "helicopters": (0, 3),
        "relief_trucks": (3, 15),
        "water_purifiers": (2, 10),
    },
    "earthquake": {
        "search_rescue_teams": (3, 12),
        "heavy_machinery": (2, 8),
        "medical_units": (2, 6),
        "blood_banks": (1, 3),
        "tents": (100, 1000),
        "helicopters": (1, 5),
    },
    "cyclone": {
        "evacuation_buses": (10, 100),
        "shelter_teams": (5, 20),
        "ndrf_teams": (2, 8),
        "power_restoration": (3, 15),
        "food_packets": (1000, 50000),
    },
    "drought": {
        "water_tankers": (5, 50),
        "food_relief": (10, 200),
        "medical_camps": (2, 10),
        "cattle_relief": (5, 30),
    },
    "wildfire": {
        "fire_trucks": (3, 20),
        "water_bombers": (0, 5),
        "evacuation_teams": (5, 25),
        "medical_units": (1, 4),
    },
    "landslide": {
        "ndrf_teams": (2, 8),
        "heavy_machinery": (3, 12),
        "search_dogs": (2, 6),
        "medical_units": (1, 4),
        "helicopters": (1, 3),
    },
}


def allocate_resources(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute recommended resource allocation for an incident.
    
    Args:
        request: dict with incident_type, affected_population, priority
    """
    incident_type = request.get("incident_type", "unknown").lower()
    affected = request.get("affected_population", 10000)
    priority = request.get("priority", "high")

    # Scale factor based on population
    if affected < 1000:
        scale = 0.3
    elif affected < 10000:
        scale = 0.5
    elif affected < 100000:
        scale = 1.0
    elif affected < 1000000:
        scale = 2.0
    else:
        scale = 4.0

    # Priority multiplier
    priority_mult = {"low": 0.5, "medium": 1.0, "high": 1.5, "critical": 2.5}.get(priority, 1.0)
    total_scale = scale * priority_mult

    # Find closest disaster type
    matched_type = None
    for key in RESOURCE_REQUIREMENTS:
        if key in incident_type or incident_type in key:
            matched_type = key
            break
    if not matched_type:
        matched_type = "flood"  # default

    requirements = RESOURCE_REQUIREMENTS[matched_type]
    allocation = {}
    total_units = 0

    for resource, (min_qty, max_qty) in requirements.items():
        recommended = min(int(min_qty * total_scale + (max_qty - min_qty) * min(total_scale / 4, 1)), max_qty)
        recommended = max(recommended, min_qty)
        allocation[resource] = {
            "recommended": recommended,
            "minimum": min_qty,
            "maximum": max_qty,
            "priority": "critical" if resource in ["medical_units", "ndrf_teams", "search_rescue_teams"] else "normal",
        }
        total_units += recommended

    return {
        "incident_type": matched_type,
        "affected_population": affected,
        "priority": priority,
        "scale_factor": round(total_scale, 2),
        "allocation": allocation,
        "total_units_needed": total_units,
        "estimated_cost_inr": total_units * 50000,  # rough estimate
        "deployment_time_hours": 2 if priority == "critical" else 6,
    }
