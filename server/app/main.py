import os
import datetime
import json
import re
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
from app.services.amadeus_service import amadeus_service
from app.services.weather_service import weather_service
from app.services.opentripmap_service import opentripmap_service

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


    return user


@app.get("/")
def read_root():
    return {"message": "Welcome to Safar API"}


@app.post("/api/auth/sync-user", response_model=schemas.SyncUserResponse)
async def sync_user(body: schemas.SyncUserRequest, db: Session = Depends(get_db)):
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
            home_location=None,
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


@app.patch("/api/auth/me", response_model=schemas.UserProfile)
async def update_me(
    body: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if body.home_location is not None:
        current_user.home_location = body.home_location
    if body.full_name is not None:
        current_user.full_name = body.full_name
    
    current_user.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/generate", response_model=schemas.ItineraryResponse)
@limiter.limit("5/minute")
async def generate_itinerary(request: Request, body: schemas.ItineraryRequest):
    try:
        poi_context = ""
        if body.latitude and body.longitude:
            try:
                pois = await opentripmap_service.get_places_by_radius(body.latitude, body.longitude, radius=10000)
                if pois:
                    poi_names = [p.get("name") for p in pois if p.get("name")][:15]
                    poi_context = f"\n\nREAL VERIFIED PLACES IN {body.locationName} (PRIORITIZE THESE IN THE ITINERARY):\n" + ", ".join(poi_names) + "\n\n"
            except Exception as e:
                api_logger.warning("Failed to fetch POIs for context", extra={"error": str(e)})

        final_prompt = body.itineraryPrompt + poi_context

        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=final_prompt,
        )
        itinerary_text = response.text

        print("\n" + "="*50)
        print("📄 RAW RESPONSE FROM GEMINI:")
        print(itinerary_text[:1000] + "..." if len(itinerary_text) > 1000 else itinerary_text)
        print("="*50 + "\n")

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
# DISCOVERY (Amadeus, Weather, OpenTripMap)
# -------------------------------------------------------------------

@app.get("/api/discovery/inspiration", response_model=schemas.InspirationResponse)
@cache(expire=3600)
async def get_flight_inspiration(
    current_user: models.User = Depends(get_current_user),
    max_price: Optional[int] = None
):
    # Use user's home location if available
    origin = "BOM" # Default fallback
    if current_user.home_location and isinstance(current_user.home_location, dict):
        origin = current_user.home_location.get("iataCode")
        if not origin:
            # Try to search by city name if IATA is missing
            city = current_user.home_location.get("name") or current_user.home_location.get("city")
            if city:
                airports = await amadeus_service.search_airports(city)
                if airports:
                    origin = airports[0].get("iataCode")
        
    if not origin:
        origin = "BOM"

    data = await amadeus_service.get_flight_inspiration(origin, max_price)
    return {"destinations": data}


@app.get("/api/discovery/weather")
async def get_weather(
    city: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Fetch weather info for a city, with a shared 24-hour database cache.
    """
    city_key = city.lower().strip()
    
    # 1. Check DB Cache
    now = datetime.datetime.utcnow()
    one_day_ago = now - datetime.timedelta(hours=24)
    
    cached = db.query(models.WeatherCache).filter(
        models.WeatherCache.city == city_key,
        models.WeatherCache.updated_at >= one_day_ago
    ).first()
    
    if cached:
        api_logger.info("WEATHER CACHE HIT", extra={"city": city_key})
        return cached.weather_data

    # 2. Cache Miss - Fetch from API
    api_logger.info("WEATHER CACHE MISS", extra={"city": city_key})
    current = await weather_service.get_current_weather(city)
    forecast = await weather_service.get_forecast_weather(city)
    
    weather_payload = {"current": current, "forecast": forecast}
    
    # 3. Update or Create Cache Entry
    existing = db.query(models.WeatherCache).filter(models.WeatherCache.city == city_key).first()
    if existing:
        existing.weather_data = weather_payload
        existing.updated_at = now
    else:
        new_cache = models.WeatherCache(
            city=city_key,
            weather_data=weather_payload
        )
        db.add(new_cache)
    
    db.commit()
    return weather_payload


@app.get("/api/discovery/places", response_model=schemas.PlacesResponse)
@cache(expire=3600)
async def get_places(lat: float, lon: float, radius: int = 5000):
    data = await opentripmap_service.get_places_by_radius(lat, lon, radius)
    return {"places": data}


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

async def get_pexels_image(query: str) -> str:
    """Fetch a high-quality landscape image from Pexels API."""
    api_key = os.getenv("PEXELS_API_KEY")
    if not api_key:
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80"
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.pexels.com/v1/search",
                params={"query": query, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": api_key},
                timeout=5.0
            )
            if res.status_code == 200:
                data = res.json()
                photos = data.get("photos", [])
                if photos:
                    # Use 'large' or 'landscape' for good quality/aspect ratio
                    return photos[0]["src"]["large"]
    except Exception as e:
        api_logger.warning("Pexels fetch failed", extra={"query": query, "error": str(e)})
    
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80"


@app.post("/api/trendingPlaces", response_model=schemas.TrendingPlacesResponse)
@limiter.limit("5/minute")
async def get_trending_places(
    request: Request, 
    body: schemas.TrendingPlacesRequest,
    db: Session = Depends(get_db)
):
    try:
        country_key = body.country.strip().upper() if body.country else "GLOBAL"
        
        # 1. Check DB Cache
        cached = db.query(models.TrendingCache).filter(models.TrendingCache.country == country_key).first()
        if cached:
            now = datetime.datetime.utcnow()
            # 90 days = 3 months
            if (now - cached.created_at).days < 90:
                api_logger.info("TRENDING CACHE HIT", extra={"country": country_key})
                return {"trendingPlaces": cached.trending_data}
            else:
                api_logger.info("TRENDING CACHE STALE, REFRESHING", extra={"country": country_key, "age_days": (now - cached.created_at).days})
        
        # 2. Fetch from Gemini
        api_logger.info("FETCHING NEW TRENDING PLACES (12 ITEMS)", extra={"country": country_key})
        client = get_gemini_client()
        
        country_name = body.country or "India"
        final_prompt = f"""Suggest a mix of 12 trending travel destinations (6 domestic within {country_name} and 6 popular international spots) for someone currently in {country_name}. 
        Return the result as a raw JSON array of objects with these keys: 
        - "name": City/Destination name
        - "title": Full display name (e.g. "Tokyo, Japan")
        - "country": Country name
        - "desc": Short 1-sentence catchy description
        - "famous_landmark": A specific famous place in that destination
        - "pexels_query": A highly optimized keyword-rich search query for a STUNNING landscape photo of this place (e.g., "Cinematic sunset photography [Landmark] [Name]")
        - "insight": A 2-sentence "Discovery Insight" explaining WHY this place is trending or what makes it culturally/visually unique right now.
        - "recommended_month": Best month(s) to visit this specific place.
        No markdown, no extra text."""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=final_prompt,
        )
        
        raw_text = response.text
        api_logger.info("GEMINI RESPONSE RECEIVED", extra={"raw_text_preview": raw_text[:200]})

        # Extract JSON list using regex
        json_match = re.search(r"\[[\s\S]*\]", raw_text)
        if not json_match:
            api_logger.error("NO JSON ARRAY FOUND IN GEMINI RESPONSE", extra={"raw_text": raw_text})
            raise HTTPException(status_code=500, detail="Failed to parse trending places from AI response")

        json_str = json_match.group(0)
        try:
            destinations = json.loads(json_str)
        except Exception as json_err:
            api_logger.error("JSON PARSE ERROR", extra={"error": str(json_err), "json_str": json_str})
            raise HTTPException(status_code=500, detail="Invalid JSON format in AI response")

        if not isinstance(destinations, list):
            api_logger.error("GEMINI RESPONSE IS NOT A LIST", extra={"type": str(type(destinations))})
            raise HTTPException(status_code=500, detail="AI response format invalid (not a list)")

        # 3. Enrich with Pexels Images
        api_logger.info("ENRICHING TRENDING PLACES WITH PEXELS PHOTOS")
        enriched_places = []
        for i, dest in enumerate(destinations[:12]): # Ensure max 12
            landmark = dest.get("famous_landmark") or dest.get("name")
            
            # Combine AI-suggested query with quality keywords for cinematic results
            pexels_search = dest.get("pexels_query") or f"Cinematic landscape photography {landmark} {dest.get('name')}"
            image_url = await get_pexels_image(pexels_search)
            
            enriched_places.append({
                "name": dest.get("name"),
                "title": dest.get("title") or dest.get("name"),
                "country": dest.get("country"),
                "desc": dest.get("desc"),
                "famous_landmark": landmark,
                "insight": dest.get("insight"),
                "recommended_month": dest.get("recommended_month"),
                "image": image_url
            })

        # 4. Update/Insert in DB
        if cached:
            cached.trending_data = enriched_places
            cached.created_at = datetime.datetime.utcnow()
        else:
            new_cache = models.TrendingCache(
                country=country_key,
                trending_data=enriched_places
            )
            db.add(new_cache)
        
        db.commit()
        return {"trendingPlaces": enriched_places}
    except Exception as e:
        api_logger.error("Trending places failed", extra={"error": str(e), "country": body.country if 'body' in locals() else "unknown"})
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
        total_days=body.total_days,
        traveler=body.traveler,
        is_international=body.is_international,
        departure_iata=body.departure_iata,
        destination_iata=body.destination_iata,
        traveler_mode=body.traveler_mode,
        is_finished=False,
        concert_data=body.concert_data,
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
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.is_finished:
        raise HTTPException(status_code=403, detail="Trip is already finished and cannot be reactivated.")

    now = datetime.datetime.utcnow()

    # Deactivate all other trips first — only one active trip at a time
    # Also mark them as finished if they were already active
    db.query(models.UserTrip).filter(
        models.UserTrip.user_id == current_user.id,
        models.UserTrip.id != trip_id,
        models.UserTrip.is_active == True,
    ).update({
        "is_active": False, 
        "is_finished": True,
        "completed_at": now,
        "updated_at": now
    }, synchronize_session=False)

    trip.is_active = True
    trip.is_finished = False # Just in case, though checked above
    trip.activated_at = now
    trip.updated_at = now
    db.commit()
    trip_logger.info("Trip activated", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"success": True}


@app.patch("/api/trips/{trip_id}/deactivate")
async def deactivate_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark a specific trip as inactive."""
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    now = datetime.datetime.utcnow()
    trip.is_active = False
    trip.is_finished = True
    trip.completed_at = now
    trip.updated_at = now
    db.commit()
    trip_logger.info("Trip deactivated (finished)", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"success": True}


@app.patch("/api/trips/{trip_id}/budget", response_model=schemas.UserTripOut)
async def update_trip_budget(
    trip_id: str,
    req: schemas.UpdateTripBudgetRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip.total_budget = req.total_budget
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


@app.patch("/api/trips/{trip_id}/visited-indices", response_model=schemas.UserTripOut)
async def update_trip_visited_indices(
    trip_id: str,
    req: schemas.UpdateTripVisitedRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip.visited_indices = req.visited_indices
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(trip, "visited_indices")
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


@app.patch("/api/trips/{trip_id}/archive-spendings", response_model=schemas.UserTripOut)
async def archive_trip_spendings(
    trip_id: str,
    req: schemas.ArchiveSpendingsRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip.archived_spendings = req.spendings
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


@app.delete("/api/trips/{trip_id}")
async def delete_trip(trip_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trip = db.query(models.UserTrip).filter(models.UserTrip.id == trip_id, models.UserTrip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.delete(trip)
    db.commit()
    trip_logger.info("TRIP DELETED (Hard)", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"message": "Trip successfully deleted"}