import os
import datetime
import json
import asyncio
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
import sentry_sdk
import redis.asyncio as aioredis

from app.tasks import process_test_task
from app.websocket_manager import manager
from app import models, schemas, auth_utils
from app.database import engine, Base
from app.logger import auth_logger, trip_logger, api_logger
from app.services.weather_service import weather_service
from app.services.opentripmap_service import opentripmap_service
from app.config import settings
from app.rate_limiter import limiter

# Unconditionally initialize tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        environment=settings.env,
    )
    api_logger.info("Sentry initialized for Backend")

if not firebase_admin._apps:
    fb_cred = None

    if settings.firebase_service_account_json:
        try:
            cred_dict = json.loads(settings.firebase_service_account_json)
            fb_cred = credentials.Certificate(cred_dict)
            auth_logger.info("Firebase Admin initialized with JSON string from configuration")
        except json.JSONDecodeError:
            auth_logger.error("Failed to parse firebase_service_account_json - invalid JSON")
    
    if not fb_cred:
        fb_cred_path = settings.firebase_service_account_path
        if os.path.exists(fb_cred_path):
            fb_cred = credentials.Certificate(fb_cred_path)
            auth_logger.info("Firebase Admin initialized with service account file", extra={"path": fb_cred_path})
    
    if fb_cred:
        firebase_admin.initialize_app(fb_cred)
    else:
        firebase_admin.initialize_app()
        auth_logger.warning("Firebase Admin initialized WITHOUT service account (restricted access)")

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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    sentry_sdk.capture_exception(exc)
    
    api_logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
        },
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Our team has been notified."}
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

async def redis_pubsub_listener():
    redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    pubsub = redis.pubsub()
    await pubsub.subscribe("safar_notifications")
    
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    user_id = data.get("user_id")
                    if user_id:
                        await manager.send_personal_message(data, user_id)
                    else:
                        await manager.broadcast(data)
                except Exception as e:
                    api_logger.error(f"WebSocket bridge: Failed to parse/send message: {str(e)}")
    except Exception as e:
        api_logger.error(f"WebSocket bridge: Redis connection lost: {str(e)}")
    finally:
        await pubsub.unsubscribe("safar_notifications")
        await redis.close()

@app.on_event("startup")
async def startup():
    redis_url = settings.redis_url
    try:
        r = aioredis.from_url(redis_url, encoding="utf8", decode_responses=True)
        FastAPICache.init(RedisBackend(r), prefix="safar-cache")
        api_logger.info("Safar API started with Redis cache", extra={"redis": redis_url.split("@")[-1]})
        asyncio.create_task(redis_pubsub_listener())
    except Exception as e:
        api_logger.warning("Redis cache initialization failed, falling back to in-memory cache", extra={"error": str(e)})
        FastAPICache.init(InMemoryBackend(), prefix="safar-cache")

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    api_logger.info(f"WebSocket: Client {client_id} connected")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message({"status": "received", "echo": data}, client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        api_logger.info(f"WebSocket: Client {client_id} disconnected")

@app.post("/api/test-event")
async def trigger_test_event(data: str):
    task = process_test_task.delay(data) 
    return {
        "message": "Event triggered successfully!",
        "task_id": task.id,
        "status": "Processing in background..."
    }


from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")