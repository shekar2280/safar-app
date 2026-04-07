import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, UUID4

class UserProfile(BaseModel):
    id: str
    firebase_uid: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    last_login: Optional[datetime.datetime] = None
    home_location: Optional[Any] = None

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


class UserUpdate(BaseModel):
    home_location: Optional[Any] = None
    full_name: Optional[str] = None

class SavedTripOut(BaseModel):
    id: str
    normalized_key: str
    trip_plan: Any
    image_urls: List[str] = []       # list (was single image_url)
    destination_iata: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class UserTripOut(BaseModel):
    id: str
    normalized_key: Optional[str] = None
    total_days: int
    traveler: Optional[Any] = None
    is_international: bool
    departure_iata: Optional[str] = None
    destination_iata: Optional[str] = None
    traveler_mode: Optional[str] = None
    is_active: bool
    is_finished: bool
    
    total_budget: float = 0.0
    visited_indices: List[int] = []
    archived_spendings: Optional[List[Any]] = None
    
    concert_data: Optional[Any] = None

    activated_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
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
    total_days: int = 1
    traveler: Optional[Any] = None
    is_international: bool = False
    departure_iata: Optional[str] = None
    traveler_mode: str = "SOLO"
    concert_data: Optional[Any] = None


class UpdateTripBudgetRequest(BaseModel):
    total_budget: float


class UpdateTripVisitedRequest(BaseModel):
    visited_indices: List[int]


class ArchiveSpendingsRequest(BaseModel):
    spendings: List[Any]

class ItineraryRequest(BaseModel):
    itineraryPrompt: str
    locationName: str
    tripCategory: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ItineraryResponse(BaseModel):
    itinerary: str
    imageUrls: List[str]


class TrendingPlacesRequest(BaseModel):
    trendingPlacesPrompt: str
    country: Optional[str] = None


class TrendingPlace(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    country: Optional[str] = None
    desc: Optional[str] = None
    image: Optional[str] = None
    famous_landmark: Optional[str] = None
    insight: Optional[str] = None
    recommended_month: Optional[str] = None


class TrendingPlacesResponse(BaseModel):
    trendingPlaces: List[TrendingPlace]

class WeatherResponse(BaseModel):
    current: Optional[Any] = None
    forecast: Optional[Any] = None


class InspirationResponse(BaseModel):
    destinations: List[Any]


class PlacesResponse(BaseModel):
    places: List[Any]