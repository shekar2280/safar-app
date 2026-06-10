import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, JSON, Date, Integer, Float
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

    is_name_custom = Column(Boolean, default=False)

    user_trips = relationship("UserTrip", back_populates="user", cascade="all, delete-orphan")


class SavedTrip(Base):
    """Shared cached itinerary plans, keyed by normalized destination+days+budget."""
    __tablename__ = "saved_trips"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid, index=True)
    normalized_key = Column(String, unique=True, index=True, nullable=False)
    trip_plan = Column(JSON, nullable=False)
    image_urls = Column(JSON, default=list)
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

    total_days = Column(Integer, nullable=False, default=1)

    traveler = Column(JSON)
    is_international = Column(Boolean, default=False)
    departure_iata = Column(String)
    destination_iata = Column(String)
    traveler_mode = Column(String, default="SOLO")
    
    # Lifecycle
    is_active = Column(Boolean, default=False)
    is_finished = Column(Boolean, default=False)
    activated_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Wallet & Progress (Space-Efficient)
    total_budget = Column(Float, default=0.0)
    visited_indices = Column(JSON, default=list)
    skipped_indices = Column(JSON, default=list)
    archived_spendings = Column(JSON, nullable=True) # Compact historical data

    # Personal Event Data (Overwrites shared SavedTrip photos/info if present)
    concert_data = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_trips")
    saved_trip = relationship("SavedTrip", back_populates="user_trips")


class TrendingCache(Base):
    """Cached trending destinations by country, refreshed every 3-6 months."""
    __tablename__ = "trending_cache"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid, index=True)
    country = Column(String, unique=True, index=True, nullable=False)
    trending_data = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class WeatherCache(Base):
    """Shared weather cache by city, refreshed every 24 hours to stay within API limits."""
    __tablename__ = "weather_cache"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid, index=True)
    city = Column(String, unique=True, index=True, nullable=False)
    weather_data = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)