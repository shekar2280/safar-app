import os
import datetime
from typing import Optional, List

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import FastAPI, Depends, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
import redis.asyncio as aioredis
from google import genai
import httpx

from app import models, schemas, auth_utils
from app.database import engine, Base, get_db
from app.logger import auth_logger, trip_logger, api_logger, db_logger

Base.metadata.create_all(bind=engine)

# --- Firebase Admin Init ---
if not firebase_admin._apps:
    fb_cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
    if os.path.exists(fb_cred_path):
        cred = credentials.Certificate(fb_cred_path)
        firebase_admin.initialize_app(cred)
        auth_logger.info("Firebase Admin initialized with service account", extra={"path": fb_cred_path})
    else:
        firebase_admin.initialize_app()
        auth_logger.warning("Firebase Admin initialized WITHOUT service account — token verification will fail in production")

# --- Rate Limiter ---
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Safar API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    api_logger.info(
        "Incoming request",
        extra={"method": request.method, "path": request.url.path, "client": request.client.host if request.client else "unknown"},
    )
    response = await call_next(request)
    api_logger.info(
        "Response sent",
        extra={"method": request.method, "path": request.url.path, "status": response.status_code},
    )
    return response


@app.on_event("startup")
async def startup():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    r = aioredis.from_url(redis_url, encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(r), prefix="safar-cache")
    api_logger.info("Safar API started", extra={"redis": redis_url.split("@")[-1]})


def get_gemini_client():
    return genai.Client(api_key=os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"))


# --- JWT Auth Dependency ---
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    token_data = auth_utils.decode_access_token(token)
    if not token_data or not token_data.firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(models.User).filter(models.User.firebase_uid == token_data.firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# -------------------------------------------------------------------
# AUTH ENDPOINTS
# -------------------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "Welcome to Safar API"}


@app.post("/api/auth/sync-user", response_model=schemas.SyncUserResponse)
async def sync_user(body: schemas.SyncUserRequest, db: Session = Depends(get_db)):
    """
    Receives a Firebase ID token from the mobile app,
    verifies it, upserts the user in Neon DB, and returns a JWT.
    """
    try:
        decoded = firebase_auth.verify_id_token(body.firebase_id_token)
    except Exception as e:
        auth_logger.error("Firebase token verification failed", extra={"error": str(e)})
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token")

    firebase_uid = decoded.get("uid")
    email = decoded.get("email")
    full_name = decoded.get("name")
    photo_url = decoded.get("picture")

    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    now = datetime.datetime.utcnow()
    is_new_user = user is None

    if user:
        user.last_login = now
        user.updated_at = now
        if email:
            user.email = email
        if full_name:
            user.full_name = full_name
        if photo_url:
            user.photo_url = photo_url
    else:
        user = models.User(
            firebase_uid=firebase_uid,
            email=email,
            full_name=full_name,
            photo_url=photo_url,
            created_at=now,
            last_login=now,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    auth_logger.info(
        "User synced to DB",
        extra={"firebase_uid": firebase_uid, "email": email, "new_user": is_new_user},
    )

    access_token = auth_utils.create_access_token(data={"sub": firebase_uid})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/api/auth/me", response_model=schemas.UserProfile)
async def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# -------------------------------------------------------------------
# ITINERARY GENERATION
# -------------------------------------------------------------------

@app.post("/api/generate", response_model=schemas.ItineraryResponse)
@limiter.limit("5/minute")
async def generate_itinerary(request: Request, body: schemas.ItineraryRequest):
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=body.itineraryPrompt,
        )
        itinerary_text = response.text

        image_urls = [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1080&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80",
            "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1080&q=80",
        ]

        if body.tripCategory != "CONCERT":
            unsplash_api_key = os.getenv("UNSPLASH_API_KEY")
            if unsplash_api_key:
                async with httpx.AsyncClient() as http_client:
                    unsplash_res = await http_client.get(
                        "https://api.unsplash.com/search/photos",
                        params={
                            "query": body.locationName,
                            "per_page": 3,
                            "orientation": "landscape",
                            "order_by": "relevant",
                        },
                        headers={"Authorization": f"Client-ID {unsplash_api_key}"},
                        timeout=5.0,
                    )
                    if unsplash_res.status_code == 200:
                        results = unsplash_res.json().get("results", [])
                        if results:
                            image_urls = [
                                f"{img['urls']['raw']}&auto=format&fit=crop&w=1080&h=720&q=80"
                                for img in results
                            ]

        return {"itinerary": itinerary_text, "imageUrls": image_urls}
    except Exception as e:
        api_logger.error("Generate itinerary failed", extra={"error": str(e), "location": body.locationName}, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------------
# CONCERT FINDER
# -------------------------------------------------------------------

@app.get("/api/concert")
@cache(expire=3600)
@limiter.limit("10/minute")
async def find_concerts(request: Request, artistName: str):
    ticketmaster_key = os.getenv("TICKETMASTER_API_KEY")
    if not ticketmaster_key:
        raise HTTPException(status_code=500, detail="Ticketmaster API key missing")
    async with httpx.AsyncClient() as http_client:
        url = (
            f"https://app.ticketmaster.com/discovery/v2/events.json"
            f"?apikey={ticketmaster_key}&keyword={artistName}&classificationName=music"
        )
        res = await http_client.get(url)
        if res.status_code != 200:
            return []
        return res.json().get("_embedded", {}).get("events", [])


# -------------------------------------------------------------------
# TRENDING PLACES
# -------------------------------------------------------------------

@app.post("/api/trendingPlaces", response_model=schemas.TrendingPlacesResponse)
@limiter.limit("5/minute")
async def get_trending_places(request: Request, body: schemas.TrendingPlacesRequest):
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=body.trendingPlacesPrompt,
        )
        return {"trendingPlaces": response.text}
    except Exception as e:
        api_logger.error("Trending places failed", extra={"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------------
# TRIPS
# -------------------------------------------------------------------

@app.get("/api/trips/saved/{normalized_key}", response_model=schemas.SavedTripOut)
async def get_saved_trip(normalized_key: str, db: Session = Depends(get_db)):
    """Return a cached shared itinerary plan if one exists for this destination+days+budget."""
    trip = db.query(models.SavedTrip).filter(models.SavedTrip.normalized_key == normalized_key).first()
    if not trip:
        trip_logger.info("CACHE MISS", extra={"normalized_key": normalized_key})
        raise HTTPException(status_code=404, detail="No cached trip found")
    trip_logger.info("CACHE HIT", extra={"normalized_key": normalized_key, "saved_trip_id": trip.id})
    return trip


@app.post("/api/trips", response_model=schemas.UserTripOut)
async def save_trip(
    body: schemas.SaveTripRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Upsert the shared trip plan and create a new user trip record."""
    saved = db.query(models.SavedTrip).filter(models.SavedTrip.normalized_key == body.normalized_key).first()
    if not saved:
        saved = models.SavedTrip(
            normalized_key=body.normalized_key,
            trip_plan=body.trip_plan,
            image_urls=body.image_urls,         # ← list now
            destination_iata=body.destination_iata,
        )
        db.add(saved)
        db.flush()
        trip_logger.info("NEW shared trip saved", extra={"normalized_key": body.normalized_key})
    else:
        trip_logger.info("REUSING existing shared trip", extra={"normalized_key": body.normalized_key, "saved_trip_id": saved.id})

    user_trip = models.UserTrip(
        user_id=current_user.id,
        saved_trip_id=saved.id,
        normalized_key=body.normalized_key,
        start_date=body.start_date,
        end_date=body.end_date,
        traveler=body.traveler,
        is_international=body.is_international,
        departure_iata=body.departure_iata,
        destination_iata=body.destination_iata,
        trip_type=body.trip_type,
    )
    db.add(user_trip)
    db.commit()
    db.refresh(user_trip)
    trip_logger.info("Trip saved", extra={"user_id": current_user.id, "trip_id": user_trip.id})
    return user_trip


@app.get("/api/trips", response_model=List[schemas.UserTripOut])
async def get_user_trips(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Fetch all non-deleted trips for the currently authenticated user."""
    from sqlalchemy.orm import joinedload
    trips = (
        db.query(models.UserTrip)
        .options(joinedload(models.UserTrip.saved_trip))
        .filter(
            models.UserTrip.user_id == current_user.id,
            models.UserTrip.is_deleted == False,        # ← soft delete filter
        )
        .order_by(models.UserTrip.created_at.desc())
        .all()
    )
    return trips


@app.patch("/api/trips/{trip_id}/activate")
async def activate_trip(
    trip_id: str,                                       # ← str UUID now
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark a trip as active and deactivate all other trips for this user."""
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
        models.UserTrip.is_deleted == False,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Deactivate all other trips first — only one active trip at a time
    db.query(models.UserTrip).filter(
        models.UserTrip.user_id == current_user.id,
        models.UserTrip.id != trip_id,
    ).update({"is_active": False}, synchronize_session=False)

    trip.is_active = True
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    trip_logger.info("Trip activated", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"success": True}


@app.delete("/api/trips/{trip_id}")
async def delete_trip(
    trip_id: str,                                       # ← str UUID now
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Soft-delete a user's trip (sets is_deleted=True, records deleted_at)."""
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
        models.UserTrip.is_deleted == False,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip.is_deleted = True
    trip.deleted_at = datetime.datetime.utcnow()
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    trip_logger.info("Trip soft-deleted", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"success": True}