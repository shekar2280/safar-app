import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    app_name: str = "Safar API"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/safar"
    
    # Security
    allowed_origins: List[str] = ["*"]
    
    # API Keys
    google_generative_ai_api_key: str = ""
    pexels_api_key: str = ""
    unsplash_api_key: str = ""
    ticketmaster_api_key: str = ""
    opentripmap_api_key: str = ""
    weather_api_key: str = ""
    sentry_dsn: str = ""
    
    # Firebase
    firebase_service_account_path: str = "firebase-service-account.json"
    firebase_service_account_json: str = "" # Full JSON string for production environments
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Environment
    env: str = "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
