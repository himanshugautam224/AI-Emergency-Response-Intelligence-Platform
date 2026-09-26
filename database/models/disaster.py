"""Disaster event SQLAlchemy model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from database.connection import Base


class DisasterEvent(Base):
    __tablename__ = "disaster_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    disaster_type = Column(String(100), nullable=False)
    sub_type = Column(String(100), default="")
    severity = Column(String(20), default="moderate")  # minor, moderate, major, catastrophic
    magnitude = Column(Float, nullable=True)  # for earthquakes etc.

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), default="")
    country = Column(String(100), default="India")
    state = Column(String(100), default="")

    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    total_affected = Column(Integer, default=0)
    total_deaths = Column(Integer, default=0)
    economic_damage_usd = Column(Float, default=0.0)

    source = Column(String(100), default="historical")
    source_url = Column(Text, default="")
    description = Column(Text, default="")

    created_at = Column(DateTime, default=datetime.utcnow)
