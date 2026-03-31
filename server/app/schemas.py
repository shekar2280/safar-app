import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, UUID4


# --- User ---

class UserProfile(BaseModel):
    id: str                          # UUID string
    firebase_uid: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    last_login: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class SyncUserRequest(BaseModel):
    firebase_id_token: str


class SyncUserResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    firebase_uid: Optional[str] = None


# --- Trips ---

class SavedTripOut(BaseModel):
    id: str                          # UUID string
    normalized_key: str
    trip_plan: Any
    image_urls: List[str] = []       # list (was single image_url)
    destination_iata: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class UserTripOut(BaseModel):
    id: str                          # UUID string
    normalized_key: Optional[str] = None
    start_date: Optional[datetime.date] = None    # proper date, not string
    end_date: Optional[datetime.date] = None      # proper date, not string
    traveler: Optional[Any] = None
    is_international: bool
    departure_iata: Optional[str] = None
    destination_iata: Optional[str] = None
    trip_type: Optional[str] = None
    is_active: bool
    is_deleted: bool = False
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    saved_trip: Optional[SavedTripOut] = None

    class Config:
        from_attributes = True


class SaveTripRequest(BaseModel):
    normalized_key: str
    trip_plan: Any
    image_urls: List[str] = []       # list (was single image_url)
    destination_iata: Optional[str] = None
    start_date: Optional[datetime.date] = None    # proper date
    end_date: Optional[datetime.date] = None      # proper date
    traveler: Optional[Any] = None
    is_international: bool = False
    departure_iata: Optional[str] = None
    trip_type: str = "planned"


# --- Itinerary ---

class ItineraryRequest(BaseModel):
    itineraryPrompt: str
    locationName: str
    tripCategory: Optional[str] = None


class ItineraryResponse(BaseModel):
    itinerary: str
    imageUrls: List[str]


class TrendingPlacesRequest(BaseModel):
    trendingPlacesPrompt: str


class TrendingPlacesResponse(BaseModel):
    trendingPlaces: str