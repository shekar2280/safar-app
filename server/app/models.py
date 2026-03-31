import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, JSON, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    photo_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_login = Column(DateTime)

    user_trips = relationship("UserTrip", back_populates="user")


class SavedTrip(Base):
    """Shared cached itinerary plans, keyed by normalized destination+days+budget."""
    __tablename__ = "saved_trips"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid, index=True)
    normalized_key = Column(String, unique=True, index=True, nullable=False)
    trip_plan = Column(JSON, nullable=False)
    image_urls = Column(JSON, default=list)       # ← was a single image_url Text; now a list
    destination_iata = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user_trips = relationship("UserTrip", back_populates="saved_trip")


class UserTrip(Base):
    """A specific trip belonging to a user."""
    __tablename__ = "user_trips"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, index=True)
    saved_trip_id = Column(UUID(as_uuid=False), ForeignKey("saved_trips.id"), nullable=False)
    normalized_key = Column(String, index=True)

    # Use proper Date columns instead of String
    start_date = Column(Date)
    end_date = Column(Date)

    traveler = Column(JSON)
    is_international = Column(Boolean, default=False)
    departure_iata = Column(String)
    destination_iata = Column(String)
    trip_type = Column(String, default="planned")
    is_active = Column(Boolean, default=False)

    # Soft delete instead of hard delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_trips")
    saved_trip = relationship("SavedTrip", back_populates="user_trips")