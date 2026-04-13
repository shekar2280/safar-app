from fastapi import APIRouter

from . import auth, trips, discovery

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])
api_router.include_router(discovery.router, prefix="/discovery", tags=["discovery"])
