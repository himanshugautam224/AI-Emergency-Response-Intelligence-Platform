"""Location and geography SQLAlchemy model."""
import uuid
from sqlalchemy import Column, String, Float, Integer
from database.connection import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    location_type = Column(String(50), default="district")  # state, district, city, village
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, default=0)
    state = Column(String(100), default="")
    country = Column(String(100), default="India")
    risk_index = Column(Float, default=0.0)  # 0-1 composite risk
