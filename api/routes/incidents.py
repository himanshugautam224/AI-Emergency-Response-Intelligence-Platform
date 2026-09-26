"""Incidents API routes — full CRUD + SOS reports."""
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.connection import get_db
from database.models.incident import Incident

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────
class IncidentCreate(BaseModel):
    title: str
    description: str = ""
    disaster_type: str = "unknown"
    alert_level: str = "medium"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: str = ""
    district: str = ""
    state: str = "India"
    affected_population: int = 0
    casualties: int = 0
    injured: int = 0
    is_sos: bool = False
    source: str = "manual"
    reported_by: str = ""


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    alert_level: Optional[str] = None
    description: Optional[str] = None
    affected_population: Optional[int] = None
    casualties: Optional[int] = None
    risk_score: Optional[float] = None


class IncidentOut(BaseModel):
    id: str
    title: str
    description: str
    disaster_type: str
    alert_level: str
    status: str
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: str
    district: str
    state: str
    affected_population: int
    casualties: int
    injured: int
    risk_score: float
    predicted_impact: float
    resources_needed: int
    confidence: float
    is_sos: bool
    source: str
    reported_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Routes ──────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[IncidentOut])
async def list_incidents(
    status: Optional[str] = Query(None),
    alert_level: Optional[str] = Query(None),
    disaster_type: Optional[str] = Query(None),
    is_sos: Optional[bool] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    """List incidents with optional filters."""
    query = db.query(Incident).order_by(desc(Incident.created_at))
    if status:
        query = query.filter(Incident.status == status)
    if alert_level:
        query = query.filter(Incident.alert_level == alert_level)
    if disaster_type:
        query = query.filter(Incident.disaster_type == disaster_type)
    if is_sos is not None:
        query = query.filter(Incident.is_sos == is_sos)
    return query.offset(offset).limit(limit).all()


@router.get("/sos", response_model=List[IncidentOut])
async def list_sos_reports(db: Session = Depends(get_db)):
    """Get all SOS reports."""
    return db.query(Incident).filter(Incident.is_sos == True).order_by(
        desc(Incident.created_at)
    ).all()


@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@router.post("/", response_model=IncidentOut, status_code=201)
async def create_incident(data: IncidentCreate, db: Session = Depends(get_db)):
    """Create a new incident or SOS report."""
    from ml.risk_prediction.predict import predict_risk

    inc = Incident(
        id=str(uuid.uuid4()),
        **data.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    # Auto-run risk prediction
    try:
        pred = predict_risk({
            "disaster_type": data.disaster_type,
            "affected_population": data.affected_population,
            "latitude": data.latitude or 20.5937,
            "longitude": data.longitude or 78.9629,
        })
        inc.risk_score = pred.get("risk_score", 0.0)
        inc.predicted_impact = pred.get("predicted_impact", 0.0)
        inc.resources_needed = pred.get("resources_needed", 0)
        inc.confidence = pred.get("confidence", 0.0)
    except Exception:
        pass  # ML failure doesn't block incident creation

    db.add(inc)
    db.commit()
    db.refresh(inc)
    return inc


@router.patch("/{incident_id}", response_model=IncidentOut)
async def update_incident(
    incident_id: str, data: IncidentUpdate, db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(inc, field, value)
    inc.updated_at = datetime.utcnow()
    if data.status == "resolved":
        inc.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)
    return inc


@router.delete("/{incident_id}", status_code=204)
async def delete_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(inc)
    db.commit()
