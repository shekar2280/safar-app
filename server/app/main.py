import os
import datetime
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
import redis.asyncio as aioredis

from app import models, schemas, auth_utils
from app.database import engine, Base
from app.logger import auth_logger, trip_logger, api_logger
from app.services.weather_service import weather_service
from app.services.opentripmap_service import opentripmap_service
from app.config import settings

if settings.env == "development":
    Base.metadata.create_all(bind=engine)

if not firebase_admin._apps:
    fb_cred_path = settings.firebase_service_account_path
    if os.path.exists(fb_cred_path):
        cred = credentials.Certificate(fb_cred_path)
        firebase_admin.initialize_app(cred)
        auth_logger.info("Firebase Admin initialized with service account", extra={"path": fb_cred_path})
    else:
        firebase_admin.initialize_app()
        auth_logger.warning("Firebase Admin initialized WITHOUT service account")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.app_name, debug=settings.debug)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    if settings.debug:
        api_logger.debug(
            "Incoming request",
            extra={"method": request.method, "path": request.url.path, "client": request.client.host if request.client else "unknown"},
        )
    
    response = await call_next(request)
    
    if settings.debug:
        api_logger.debug(
            "Response sent",
            extra={"method": request.method, "path": request.url.path, "status": response.status_code},
        )
    return response

@app.on_event("startup")
async def startup():
    redis_url = settings.redis_url
    try:
        r = aioredis.from_url(redis_url, encoding="utf8", decode_responses=True)
        FastAPICache.init(RedisBackend(r), prefix="safar-cache")
        api_logger.info("Safar API started with Redis cache", extra={"redis": redis_url.split("@")[-1]})
    except Exception as e:
        api_logger.warning("Redis cache initialization failed, falling back to memory", extra={"error": str(e)})
        FastAPICache.init(RedisBackend(None), prefix="safar-cache")

from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")