import asyncio
import time
import json
import redis
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import WeatherCache
from app.services.weather_service import weather_service
from app.logger import trip_logger
from app.config import settings

@celery_app.task(name="app.tasks.process_test_task")
def process_test_task(data: str):
    trip_logger.info(f"CELERY: Starting test task with data: {data}")
    time.sleep(5) 
    trip_logger.info(f"CELERY: Finished test task: {data}")
    return {"status": "completed", "result": f"Echo: {data}"}

@celery_app.task(name="app.tasks.update_trip_weather")
def update_trip_weather(city: str, user_id: str = None):
    trip_logger.info(f"CELERY: Updating weather for {city}")
    
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    try:
        weather_data = loop.run_until_complete(weather_service.get_forecast_weather(city))
    except Exception as e:
        trip_logger.error(f"CELERY: Error during weather fetch for {city}: {str(e)}")
        return

    if not weather_data:
        trip_logger.error(f"CELERY: No weather data returned for {city}")
        return

    db = SessionLocal()
    try:
        cache_entry = db.query(WeatherCache).filter(WeatherCache.city == city).first()
        if cache_entry:
            cache_entry.weather_data = weather_data
        else:
            cache_entry = WeatherCache(city=city, weather_data=weather_data)
            db.add(cache_entry)
        
        db.commit()
        trip_logger.info(f"CELERY: Successfully updated WeatherCache for {city}")

        r = redis.from_url(settings.redis_url)
        notification = {
            "type": "weather_update",
            "city": city,
            "user_id": user_id,
            "status": "success",
            "data": weather_data
        }
        r.publish("safar_notifications", json.dumps(notification))
        trip_logger.info(f"CELERY: Published notification for {city} to Redis")

    except Exception as e:
        db.rollback()
        trip_logger.error(f"CELERY: DB Update failed for {city}: {str(e)}")
    finally:
        db.close()
