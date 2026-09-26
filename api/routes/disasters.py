"""Disasters (historical events) API routes."""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime

from database.connection import get_db
from database.models.disaster import DisasterEvent

router = APIRouter()


class DisasterOut(BaseModel):
    id: str
    name: str
    disaster_type: str
    sub_type: str
    severity: str
    magnitude: Optional[float]
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: str
    country: str
    state: str
    start_date: Optional[datetime]
    total_affected: int
    total_deaths: int
    economic_damage_usd: float
    source: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[DisasterOut])
async def list_disasters(
    disaster_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(DisasterEvent).order_by(desc(DisasterEvent.start_date))
    if disaster_type:
        query = query.filter(DisasterEvent.disaster_type.ilike(f"%{disaster_type}%"))
    if severity:
        query = query.filter(DisasterEvent.severity == severity)
    if country:
        query = query.filter(DisasterEvent.country.ilike(f"%{country}%"))
    return query.limit(limit).all()


@router.get("/types")
async def get_disaster_types(db: Session = Depends(get_db)):
    types = db.query(DisasterEvent.disaster_type, func.count(DisasterEvent.id)).group_by(
        DisasterEvent.disaster_type
    ).all()
    return [{"type": t, "count": c} for t, c in types]


@router.get("/timeline")
async def get_timeline(
    disaster_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Return yearly incident counts for analytics chart."""
    from sqlalchemy import extract
    query = db.query(
        extract("year", DisasterEvent.start_date).label("year"),
        func.count(DisasterEvent.id).label("count"),
        func.sum(DisasterEvent.total_deaths).label("deaths"),
        func.sum(DisasterEvent.total_affected).label("affected"),
    ).filter(DisasterEvent.start_date.isnot(None))
    if disaster_type:
        query = query.filter(DisasterEvent.disaster_type.ilike(f"%{disaster_type}%"))
    results = query.group_by("year").order_by("year").all()
    return [
        {"year": int(r.year), "count": r.count, "deaths": r.deaths or 0, "affected": r.affected or 0}
        for r in results if r.year
    ]
