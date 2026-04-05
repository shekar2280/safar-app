import os
import time
import httpx
from typing import Optional, List, Dict, Any
from app.logger import api_logger

class AmadeusService:
    def __init__(self):
        self.api_key = os.getenv("AMADEUS_API_KEY")
        self.api_secret = os.getenv("AMADEUS_SECRET_KEY")
        self.base_url = "https://test.api.amadeus.com" # Use 'test' for development
        self._token = None
        self._token_expires_at = 0

    async def _get_token(self) -> str:
        """Fetch or refresh the OAuth2 token."""
        if self._token and time.time() < self._token_expires_at:
            return self._token

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v1/security/oauth2/token",
                    data={
                        "grant_type": "client_credentials",
                        "client_id": self.api_key,
                        "client_secret": self.api_secret,
                    },
                )
                response.raise_for_status()
                data = response.json()
                self._token = data["access_token"]
                # Token expires in 'expires_in' seconds (usually 1800)
                self._token_expires_at = time.time() + data["expires_in"] - 60 
                return self._token
            except Exception as e:
                api_logger.error("Amadeus token fetch failed", extra={"error": str(e)})
                raise Exception("Could not authenticate with Amadeus")

    async def get_flight_inspiration(self, origin: str, max_price: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Find cheap destinations from an origin.
        API: /v1/shopping/flight-destinations
        """
        try:
            token = await self._get_token()
        except Exception as e:
            api_logger.error("Amadeus token failed in flight inspiration", extra={"error": str(e)})
            return []

        params = {"origin": origin}
        if max_price:
            params["maxPrice"] = max_price

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/v1/shopping/flight-destinations",
                    params=params,
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    raw_data = response.json().get("data", [])
                    # Normalize data structure
                    processed_data = []
                    for item in raw_data:
                        processed_data.append({
                            "destination": item.get("destination"),
                            "departureDate": item.get("departureDate"),
                            "returnDate": item.get("returnDate"),
                            "price": item.get("price", {}).get("total"),
                        })

                    api_logger.info("Amadeus flight inspiration success", extra={
                        "origin": origin,
                        "results_count": len(processed_data)
                    })
                    return processed_data
                
                api_logger.warning("Amadeus flight inspiration empty/error", extra={
                    "status_code": response.status_code,
                    "body": response.text[:500],
                    "origin": origin
                })
                return []
            except Exception as e:
                api_logger.error("Amadeus flight inspiration network failed", extra={"error": str(e), "origin": origin})
                return []

    async def search_airports(self, keyword: str) -> List[Dict[str, Any]]:
        """
        Search for airports/cities by keyword.
        API: /v1/reference-data/locations
        """
        try:
            token = await self._get_token()
        except Exception as e:
            api_logger.error("Amadeus token failed in airport search", extra={"error": str(e)})
            return []

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/v1/reference-data/locations",
                    params={
                        "subType": "CITY,AIRPORT",
                        "keyword": keyword,
                    },
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json().get("data", [])
                    api_logger.info("Amadeus airport search success", extra={
                        "keyword": keyword,
                        "results_count": len(data)
                    })
                    return data
                
                api_logger.warning("Amadeus airport search empty/error", extra={
                    "status_code": response.status_code,
                    "body": response.text[:500],
                    "keyword": keyword
                })
                return []
            except Exception as e:
                api_logger.error("Amadeus airport search network failed", extra={"error": str(e), "keyword": keyword})
                return []

# Singleton instance
amadeus_service = AmadeusService()
