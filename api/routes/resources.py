"""Resources API routes."""
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.connection import get_db
from database.models.resource import Resource

router = APIRouter()


class ResourceCreate(BaseModel):
    name: str
    resource_type: str
    category: str = ""
    quantity: int = 1
    unit: str = "units"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: str = ""
    agency: str = ""
    is_critical: bool = False


class ResourceOut(BaseModel):
    id: str
    name: str
    resource_type: str
    category: str
    quantity: int
    unit: str
    status: str
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: str
    agency: str
    incident_id: Optional[str]
    eta_minutes: Optional[int]
    is_critical: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ResourceOut])
async def list_resources(
    status: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Resource).order_by(desc(Resource.created_at))
    if status:
        query = query.filter(Resource.status == status)
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    return query.limit(200).all()


@router.post("/", response_model=ResourceOut, status_code=201)
async def create_resource(data: ResourceCreate, db: Session = Depends(get_db)):
    res = Resource(id=str(uuid.uuid4()), **data.model_dump(), created_at=datetime.utcnow())
    db.add(res)
    db.commit()
    db.refresh(res)
    return res


@router.patch("/{resource_id}/deploy")
async def deploy_resource(
    resource_id: str,
    incident_id: str = Query(...),
    eta_minutes: int = Query(30),
    db: Session = Depends(get_db),
):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    res.status = "deployed"
    res.incident_id = incident_id
    res.assigned_at = datetime.utcnow()
    res.eta_minutes = eta_minutes
    db.commit()
    return {"message": "Resource deployed", "resource_id": resource_id}


@router.patch("/{resource_id}/release")
async def release_resource(resource_id: str, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    res.status = "available"
    res.incident_id = None
    res.assigned_at = None
    res.eta_minutes = None
    db.commit()
    return {"message": "Resource released"}
