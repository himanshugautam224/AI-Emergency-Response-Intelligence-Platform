"""User model (Clerk-managed, local profile storage)."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from database.connection import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_user_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), default="")
    role = Column(String(50), default="user")  # user, agency, admin
    agency = Column(String(255), default="")
    phone = Column(String(30), default="")
    avatar_url = Column(String(500), default="")
    permissions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
