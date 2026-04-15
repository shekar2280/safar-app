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

from app.api.v1.router import api_router

app.include_router(api_router, prefix="/api/v1")