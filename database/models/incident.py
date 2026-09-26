"""Incident SQLAlchemy model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Boolean
from database.connection import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    disaster_type = Column(String(100), nullable=False, default="unknown")
    alert_level = Column(String(20), default="low")  # low, medium, high, critical
    status = Column(String(30), default="active")    # active, responding, resolved, closed

    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), default="")
    district = Column(String(100), default="")
    state = Column(String(100), default="India")
    country = Column(String(100), default="India")

    # Impact
    affected_population = Column(Integer, default=0)
    casualties = Column(Integer, default=0)
    injured = Column(Integer, default=0)
    displaced = Column(Integer, default=0)
    infrastructure_damage = Column(Float, default=0.0)  # USD

    # ML prediction fields
    risk_score = Column(Float, default=0.0)
    predicted_impact = Column(Float, default=0.0)
    resources_needed = Column(Integer, default=0)
    confidence = Column(Float, default=0.0)

    # Metadata
    source = Column(String(100), default="manual")
    reported_by = Column(String(255), default="")
    is_sos = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
