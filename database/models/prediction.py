"""ML Prediction results SQLAlchemy model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON
from database.connection import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, nullable=True)
    prediction_type = Column(String(50), nullable=False)  # risk, impact, resource
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(20), default="1.0")

    risk_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    features_used = Column(JSON, default=dict)
    prediction_output = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
