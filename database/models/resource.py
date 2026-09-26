"""Resource SQLAlchemy model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean
from database.connection import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False)  # vehicle, personnel, medical, equipment
    category = Column(String(100), default="")
    quantity = Column(Integer, default=1)
    unit = Column(String(50), default="units")
    status = Column(String(30), default="available")  # available, deployed, maintenance, exhausted

    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), default="")
    agency = Column(String(255), default="")

    # Assignment
    incident_id = Column(String, nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    eta_minutes = Column(Integer, nullable=True)

    is_critical = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
