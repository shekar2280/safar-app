import httpx
import sentry_sdk
from typing import Optional, List, Dict, Any
from app.logger import api_logger
from app.config import settings

class OpenTripMapService:
    def __init__(self):
        self.api_key = settings.opentripmap_api_key
        self.base_url = "https://api.opentripmap.com/0.1/en"

    async def get_places_by_radius(self, lat: float, lon: float, radius: int = 5000) -> List[Dict[str, Any]]:
        """
        Fetch places of interest within a radius.
        Returns a list of abbreviated place objects.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/places/radius",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "radius": radius,
                        "apikey": self.api_key,
                        "format": "json"
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    api_logger.info("OpenTripMap radius success", extra={
                        "lat": lat,
                        "lon": lon,
                        "results_count": len(data) if isinstance(data, list) else "unknown"
                    })
                    return data
                
                api_logger.warning("OpenTripMap radius error", extra={
                    "status_code": response.status_code,
                    "lat": lat,
                    "lon": lon
                })
                return []
            except Exception as e:
                sentry_sdk.capture_exception(e)
                api_logger.error("OpenTripMap radius search failed", extra={"error": str(e), "lat": lat, "lon": lon})
                return []

    async def get_place_details(self, xid: str) -> Optional[Dict[str, Any]]:
        """
        Fetch full details for a specific place using its XID.
        Includes descriptions, images, and categories.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/places/xid/{xid}",
                    params={"apikey": self.api_key},
                )
                if response.status_code == 200:
                    data = response.json()
                    api_logger.info("OpenTripMap details success", extra={
                        "xid": xid,
                        "name": data.get("name")
                    })
                    return data
                
                api_logger.warning("OpenTripMap details error", extra={
                    "status_code": response.status_code,
                    "xid": xid
                })
                return None
            except Exception as e:
                sentry_sdk.capture_exception(e)
                api_logger.error("OpenTripMap details fetch failed", extra={"error": str(e), "xid": xid})
                return None

# Singleton instance
opentripmap_service = OpenTripMapService()
