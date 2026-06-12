import os
import httpx
import sentry_sdk
from typing import Optional, Dict, Any
from app.logger import api_logger
from app.config import settings

class WeatherService:
    def __init__(self):
        self.api_key = settings.weather_api_key or os.getenv("WEATHER_API", "")
        self.base_url = "https://api.openweathermap.org/data/2.5"

    async def get_current_weather(self, city: str) -> Optional[Dict[str, Any]]:
        """
        Fetch current weather for a city using OpenWeatherMap.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={"q": city, "appid": self.api_key, "units": "metric"},
                )
                if response.status_code == 200:
                    data = response.json()
                    api_logger.info("Weather current success", extra={
                        "city": city,
                        "temp_c": data.get("main", {}).get("temp")
                    })
                    return data
                
                api_logger.warning("Weather current error", extra={
                    "status_code": response.status_code,
                    "city": city,
                    "response": response.text[:200]
                })
                return None
            except Exception as e:
                sentry_sdk.capture_exception(e)
                api_logger.error("Weather current fetch failed", extra={"error": str(e), "city": city})
                return None

    async def get_forecast_weather(self, city: str, days: int = 3) -> Optional[Dict[str, Any]]:
        """
        Fetch forecast for a city using OpenWeatherMap.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={"q": city, "appid": self.api_key, "units": "metric", "cnt": days * 8}, # CNT is number of timestamps (every 3h)
                )
                if response.status_code == 200:
                    data = response.json()
                    api_logger.info("Weather forecast success", extra={
                        "city": city,
                        "cnt": data.get("cnt")
                    })
                    return data
                
                api_logger.warning("Weather forecast error", extra={
                    "status_code": response.status_code,
                    "city": city,
                    "response": response.text[:200]
                })
                return None
            except Exception as e:
                sentry_sdk.capture_exception(e)
                api_logger.error("Weather forecast fetch failed", extra={"error": str(e), "city": city})
                return None

# Singleton instance
weather_service = WeatherService()
