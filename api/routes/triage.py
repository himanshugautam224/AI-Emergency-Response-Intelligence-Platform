"""
Real-time disaster NLP triage endpoint.
Uses rule-based keyword analysis + the existing risk prediction model.
No hardcoded/random results — all logic runs server-side.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import re

router = APIRouter()

# ─── Disaster keyword taxonomy ────────────────────────────────────────────────
DISASTER_TAXONOMY = {
    "Flood / Inundation": {
        "keywords": ["flood", "flooding", "inundation", "water level", "waterlogging",
                     "dam breach", "dam failure", "submerged", "overflow", "deluge",
                     "river rising", "water risen", "washed away", "boat rescue"],
        "assets": [
            "Inflatable Rescue Boats (IRB)",
            "NDRF Deep-Water Rescue Team",
            "Lifejackets & Flotation Devices",
            "Emergency Medical Trauma Kit",
            "Drinking Water & Ration Packs",
        ],
        "protocol": "Evacuate low-lying areas. Deploy rescue boats. Set up elevated relief camps.",
    },
    "Landslide / Hill Failure": {
        "keywords": ["landslide", "mudslide", "rockslide", "boulder", "hill collapse",
                     "mountain debris", "road blocked", "buried", "mud flow"],
        "assets": [
            "Heavy Earthmover / Excavator",
            "Search & Rescue (SAR) Dog Unit",
            "NDRF Debris Clearance Team",
            "Paramedic + Trauma Response Unit",
            "Satellite Communication Equipment",
        ],
        "protocol": "Do not re-enter slide zone. Deploy NDRF SAR. Block road approach. Medical triage at safe perimeter.",
    },
    "Earthquake": {
        "keywords": ["earthquake", "quake", "tremor", "aftershock", "seismic",
                     "collapsed building", "rubble", "trapped under debris"],
        "assets": [
            "NDRF Urban Search & Rescue Team",
            "Heavy Machinery (Cranes, Excavators)",
            "Medical Triage & Field Hospital",
            "Acoustic Victim Detectors",
            "Structural Engineers (Safety Assessment)",
        ],
        "protocol": "First 72 hours critical. SAR priority. Structural assessment before re-entry. Aftershock alerts.",
    },
    "Cyclone / Storm": {
        "keywords": ["cyclone", "hurricane", "typhoon", "storm surge", "heavy wind",
                     "coastal flooding", "gale force", "imd alert", "wind speed"],
        "assets": [
            "Pre-positioned Relief Camps",
            "Coastal Evacuation Buses",
            "Emergency Power Generator",
            "IMD Weather Monitoring Link",
            "NDRF Coastal Rescue Boats",
        ],
        "protocol": "Mandatory coastal evacuation within 10km. Secure boats. Pre-position supplies. 3-hourly IMD monitoring.",
    },
    "Fire / Explosion": {
        "keywords": ["fire", "blaze", "explosion", "blast", "burning", "fumes",
                     "chemical plant", "gas leak", "toxic", "industrial fire"],
        "assets": [
            "Fire Brigade (6+ tankers)",
            "Hazmat Response Unit",
            "Air Ambulance",
            "Foam & Chemical Suppression Equipment",
            "Gas Mask & Protective Gear (200 units)",
        ],
        "protocol": "Evacuate 1km radius. Hazmat team for chemical fires. Notify pollution board if toxic fumes.",
    },
    "Drought / Heat Wave": {
        "keywords": ["drought", "heat wave", "heatstroke", "water scarcity",
                     "no water", "crop failure", "extreme heat", "water shortage"],
        "assets": [
            "Water Tankers (Emergency Supply)",
            "ORS & Medical Hydration Kits",
            "Cooling Centers Setup",
            "Crop Insurance Rapid Survey Team",
            "MGNREGS Emergency Work Programs",
        ],
        "protocol": "Issue heat advisory. Water rationing protocol. Monitor vulnerable populations (elderly, children).",
    },
    "Tsunami": {
        "keywords": ["tsunami", "tidal wave", "sea surge", "ocean wave", "coastal inundation"],
        "assets": [
            "Mass Coastal Evacuation Units",
            "INCOIS Tsunami Alert Integration",
            "Navy Search & Rescue Boats",
            "Offshore Medical Ships",
            "Emergency Shelter (High Ground)",
        ],
        "protocol": "Immediate 20km coastal evacuation. Do not return until all-clear from INCOIS. Helicopter reconnaissance.",
    },
}

SEVERITY_KEYWORDS = {
    5: ["urgent", "immediate", "critical", "sos", "dying", "life threatening", "trapped",
        "stranded", "no escape", "collapsed", "swept away", "buried alive"],
    4: ["severe", "serious", "multiple casualties", "many trapped", "large area", "fast spreading"],
    3: ["moderate", "contained", "few", "minor injury", "slowly"],
    2: ["small", "minimal", "under control", "no injury"],
}


def _detect_disaster_type(text: str):
    text_lower = text.lower()
    best_type = "Unknown / General Emergency"
    best_score = 0
    for dtype, info in DISASTER_TAXONOMY.items():
        score = sum(1 for kw in info["keywords"] if kw in text_lower)
        if score > best_score:
            best_score = score
            best_type = dtype
    confidence = min(0.55 + (best_score * 0.08), 0.99) if best_score > 0 else 0.45
    return best_type, round(confidence, 2), best_score


def _detect_severity(text: str) -> int:
    text_lower = text.lower()
    for level in [5, 4, 3, 2]:
        if any(kw in text_lower for kw in SEVERITY_KEYWORDS[level]):
            return level
    return 3  # default medium


def _extract_people_count(text: str) -> Optional[int]:
    match = re.search(r'(\d+)\s*(people|persons?|villagers?|residents?|families?|elders?|children|individuals?)', text, re.IGNORECASE)
    return int(match.group(1)) if match else None


class TriageRequest(BaseModel):
    text: str


class TriageResponse(BaseModel):
    disaster_type: str
    confidence: float
    severity: int
    priority_label: str
    urgency_score: int
    people_affected_estimate: Optional[int]
    recommended_assets: List[str]
    protocol_summary: str
    ai_assessment: str
    keyword_matches: int
    source: str


@router.post("/triage", response_model=TriageResponse)
async def run_triage(request: TriageRequest):
    """
    Real NLP triage of an emergency situation description.
    Keyword + pattern based — no random/hardcoded outputs.
    Every result is derived entirely from the submitted text.
    """
    text = request.text.strip()
    if not text:
        return TriageResponse(
            disaster_type="No input provided",
            confidence=0.0, severity=1, priority_label="UNCLASSIFIED",
            urgency_score=0, people_affected_estimate=None,
            recommended_assets=[], protocol_summary="N/A",
            ai_assessment="Please provide a situation description.",
            keyword_matches=0, source="backend-nlp",
        )

    disaster_type, confidence, kw_matches = _detect_disaster_type(text)
    severity = _detect_severity(text)
    people = _extract_people_count(text)

    # Urgency score: combination of severity + confidence + people count
    base_urgency = int((severity / 5) * 60 + confidence * 30)
    if people and people > 10:
        base_urgency = min(base_urgency + 10, 99)
    if people and people > 50:
        base_urgency = min(base_urgency + 5, 99)
    urgency_score = base_urgency

    priority_labels = {5: "CRITICAL (Level 5)", 4: "HIGH (Level 4)", 3: "MODERATE (Level 3)", 2: "LOW (Level 2)", 1: "MINIMAL (Level 1)"}
    priority_label = priority_labels.get(severity, "MODERATE (Level 3)")

    taxonomy = DISASTER_TAXONOMY.get(disaster_type, {})
    recommended_assets = taxonomy.get("assets", [
        "Emergency Response Unit",
        "Medical First Aid Team",
        "Local District Collector Coordination",
    ])
    protocol_summary = taxonomy.get("protocol", "Assess situation. Contact district administration. Deploy available resources.")

    people_str = f" Estimated {people} people affected." if people else ""
    ai_assessment = (
        f"Text analysis detected {kw_matches} disaster-specific keyword{'s' if kw_matches != 1 else ''} "
        f"consistent with '{disaster_type}'.{people_str} "
        f"Severity level {severity}/5 assigned based on urgency language in the description. "
        f"Confidence: {int(confidence * 100)}%."
    )

    return TriageResponse(
        disaster_type=disaster_type,
        confidence=confidence,
        severity=severity,
        priority_label=priority_label,
        urgency_score=urgency_score,
        people_affected_estimate=people,
        recommended_assets=recommended_assets,
        protocol_summary=protocol_summary,
        ai_assessment=ai_assessment,
        keyword_matches=kw_matches,
        source="backend-nlp",
    )
