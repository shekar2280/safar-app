import os
import json
import re
import datetime
import httpx
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi_cache.decorator import cache
from slowapi import Limiter
from slowapi.util import get_remote_address
from google import genai

from app import models, schemas
from app.database import get_db
from app.logger import api_logger
from app.api.dependencies import get_current_user
from app.services.weather_service import weather_service
from app.services.opentripmap_service import opentripmap_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

def get_gemini_client():
    api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
    if not api_key:
        api_logger.error("GOOGLE_GENERATIVE_AI_API_KEY is missing")
        raise ValueError("AI API key missing")
    return genai.Client(api_key=api_key)

async def call_gemini_with_resilience(prompt: str, models_to_try: list = None):
    if models_to_try is None:
        models_to_try = [
            "gemini-3.1-flash-lite",
            "gemini-2.5-flash-lite",
            "gemini-3-flash",
            "gemini-2.5-flash"
        ]
        
    client = get_gemini_client()
    
    for current_model in models_to_try:
        attempts = 0
        max_attempts = 2
        
        while attempts < max_attempts:
            try:
                response = client.models.generate_content(
                    model=current_model,
                    contents=prompt,
                )
                return response.text
            except Exception as e:
                error_str = str(e).upper()
                attempts += 1

                is_rate_limit = "503" in error_str or "UNAVAILABLE" in error_str or "EXHAUSTED" in error_str
                
                if is_rate_limit:
                    if attempts < max_attempts:
                        wait_time = attempts * 2 
                        api_logger.warning(f"Gemini {current_model} busy/quota. Retrying in {wait_time}s...", extra={"attempt": attempts})
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        api_logger.warning(f"Model {current_model} busy/quota after {max_attempts} attempts. Switching to next model...")
                        break
                
                api_logger.error(f"Error with model {current_model}: {str(e)}. Switching to next model...")
                break
            
    raise HTTPException(
        status_code=503, 
        detail="We're experiencing high demand right now. Please try again in a moment."
    )

async def get_pexels_image(query: str) -> str:
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
                    return photos[0]["src"]["large"]
    except Exception as e:
        api_logger.warning("Pexels fetch failed", extra={"query": query, "error": str(e)})
    
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80"



@router.get("/weather")
async def get_weather(
    city: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    city_key = city.lower().strip()
    now = datetime.datetime.utcnow()
    one_day_ago = now - datetime.timedelta(hours=24)
    cached = db.query(models.WeatherCache).filter(
        models.WeatherCache.city == city_key,
        models.WeatherCache.updated_at >= one_day_ago
    ).first()
    if cached:
        api_logger.info("WEATHER CACHE HIT", extra={"city": city_key})
        return cached.weather_data
    api_logger.info("WEATHER CACHE MISS", extra={"city": city_key})
    current = await weather_service.get_current_weather(city)
    forecast = await weather_service.get_forecast_weather(city)
    weather_payload = {"current": current, "forecast": forecast}
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


@router.get("/places", response_model=schemas.PlacesResponse)
@cache(expire=3600)
async def get_places(lat: float, lon: float, radius: int = 5000):
    data = await opentripmap_service.get_places_by_radius(lat, lon, radius)
    return {"places": data}


@router.get("/concert")
@cache(expire=3600)
@limiter.limit("10/minute")
async def find_concerts(request: Request, artistName: str):
    ticketmaster_key = os.getenv("TICKETMASTER_API_KEY")
    if not ticketmaster_key:
        raise HTTPException(status_code=503, detail="Concert discovery is temporarily unavailable. Check back soon!")
    async with httpx.AsyncClient() as http_client:
        url = (
            f"https://app.ticketmaster.com/discovery/v2/events.json"
            f"?apikey={ticketmaster_key}&keyword={artistName}&classificationName=music"
        )
        res = await http_client.get(url)
        if res.status_code != 200:
            return []
        return res.json().get("_embedded", {}).get("events", [])


@router.post("/trending", response_model=schemas.TrendingPlacesResponse)
@limiter.limit("5/minute")
async def get_trending_places(
    request: Request, 
    body: schemas.TrendingPlacesRequest,
    db: Session = Depends(get_db)
):
    try:
        country_key = body.country.strip().upper() if body.country else "GLOBAL"
        cached = db.query(models.TrendingCache).filter(models.TrendingCache.country == country_key).first()
        if cached:
            now = datetime.datetime.utcnow()
            if (now - cached.created_at).days < 90:
                api_logger.info("TRENDING CACHE HIT", extra={"country": country_key})
                return {"trendingPlaces": cached.trending_data}
            else:
                api_logger.info("TRENDING CACHE STALE, REFRESHING", extra={"country": country_key, "age_days": (now - cached.created_at).days})
        
        api_logger.info("FETCHING NEW TRENDING PLACES", extra={"country": country_key})
        country_name = body.country or "India"
        
        base_prompt = body.trendingPlacesPrompt if body.trendingPlacesPrompt else f"Suggest exactly 20 top travel destinations strictly within {country_name}. Include a mix of the country's most iconic, world-famous major cities AND highly trending seasonal destinations. Return JSON array."
        
        trending_prompt = f"""{base_prompt}

CRITICAL BACKEND INSTRUCTION:
You MUST also add a "pexels_query" field to EVERY JSON object.
- "pexels_query": A highly optimized keyword-rich search query for a STUNNING landscape photo of this place (e.g., "Cinematic sunset photography [Landmark] [Name]")"""

        raw_text = await call_gemini_with_resilience(trending_prompt)
        api_logger.info("GEMINI RESPONSE RECEIVED", extra={"raw_text_preview": raw_text[:200]})

        json_match = re.search(r"\[[\s\S]*\]", raw_text)
        if not json_match:
            api_logger.error("NO JSON ARRAY FOUND IN GEMINI RESPONSE", extra={"raw_text": raw_text})
            raise HTTPException(status_code=500, detail="We couldn't refresh trending spots just now. Please try again later.")

        json_str = json_match.group(0)
        try:
            destinations = json.loads(json_str)
        except Exception as json_err:
            api_logger.error("JSON PARSE ERROR", extra={"error": str(json_err), "json_str": json_str})
            raise HTTPException(status_code=500, detail="Something went wrong while curating destinations. Please try again.")

        if not isinstance(destinations, list):
            api_logger.error("GEMINI RESPONSE IS NOT A LIST", extra={"type": str(type(destinations))})
            raise HTTPException(status_code=500, detail="AI response format invalid (not a list)")

        api_logger.info("ENRICHING TRENDING PLACES WITH PEXELS PHOTOS")
        enriched_places = []
        for i, dest in enumerate(destinations[:12]):
            landmark = dest.get("famous_landmark") or dest.get("name")
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


@router.post("/generate", response_model=schemas.ItineraryResponse)
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
        itinerary_text = await call_gemini_with_resilience(final_prompt)
        
        api_logger.info("GEMINI ITINERARY GENERATED", extra={"location": body.locationName})

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
    except HTTPException:
        raise
    except Exception as e:
        api_logger.error("Generate itinerary failed", extra={"error": str(e), "location": body.locationName}, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
