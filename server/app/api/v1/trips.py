import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.orm import joinedload

from app import models, schemas
from app.database import get_db
from app.logger import trip_logger
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/saved/{normalized_key}", response_model=schemas.SavedTripOut)
async def get_saved_trip(normalized_key: str, db: Session = Depends(get_db)):
    """Return a cached shared itinerary plan if one exists for this destination+days+budget."""
    trip = db.query(models.SavedTrip).filter(models.SavedTrip.normalized_key == normalized_key).first()
    if not trip:
        trip_logger.info("CACHE MISS", extra={"normalized_key": normalized_key})
        raise HTTPException(status_code=404, detail="We couldn't find a saved plan for this destination. Try generating a new one!")
    trip_logger.info("CACHE HIT", extra={"normalized_key": normalized_key, "saved_trip_id": trip.id})
    return trip


@router.post("/", response_model=schemas.UserTripOut)
async def save_trip(
    body: schemas.SaveTripRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Upsert the shared trip plan and create a new user trip record."""
    saved = db.query(models.SavedTrip).filter(models.SavedTrip.normalized_key == body.normalized_key).first()
    if not saved:
        saved = models.SavedTrip(
            normalized_key=body.normalized_key,
            trip_plan=body.trip_plan,
            image_urls=body.image_urls,
            destination_iata=body.destination_iata,
        )
        db.add(saved)
        db.flush()
        trip_logger.info("NEW shared trip saved", extra={"normalized_key": body.normalized_key})
    else:
        trip_logger.info("REUSING existing shared trip", extra={"normalized_key": body.normalized_key, "saved_trip_id": saved.id})

    user_trip = models.UserTrip(
        user_id=current_user.id,
        saved_trip_id=saved.id,
        normalized_key=body.normalized_key,
        total_days=body.total_days,
        traveler=body.traveler,
        is_international=body.is_international,
        departure_iata=body.departure_iata,
        destination_iata=body.destination_iata,
        traveler_mode=body.traveler_mode,
        is_finished=False,
        concert_data=body.concert_data,
    )
    db.add(user_trip)
    db.commit()
    db.refresh(user_trip)
    trip_logger.info("Trip saved", extra={"user_id": current_user.id, "trip_id": user_trip.id})
    return user_trip


@router.get("/", response_model=List[schemas.UserTripOut])
async def get_user_trips(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Fetch all non-deleted trips for the currently authenticated user."""
    trips = (
        db.query(models.UserTrip)
        .options(joinedload(models.UserTrip.saved_trip))
        .filter(
            models.UserTrip.user_id == current_user.id,
        )
        .order_by(models.UserTrip.created_at.desc())
        .all()
    )
    return trips


@router.patch("/{trip_id}/activate")
async def activate_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark a trip as active and deactivate all other trips for this user."""
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")

    if trip.is_finished:
        raise HTTPException(status_code=403, detail="Trip is already finished and cannot be reactivated.")

    now = datetime.datetime.utcnow()

    db.query(models.UserTrip).filter(
        models.UserTrip.user_id == current_user.id,
        models.UserTrip.id != trip_id,
        models.UserTrip.is_active == True,
    ).update({
        "is_active": False, 
        "is_finished": True,
        "completed_at": now,
        "updated_at": now
    }, synchronize_session=False)

    trip.is_active = True
    trip.is_finished = False
    trip.activated_at = now
    trip.updated_at = now
    db.commit()
    trip_logger.info("Trip activated", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"success": True}


@router.patch("/{trip_id}/deactivate")
async def deactivate_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Mark a specific trip as inactive."""
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")

    now = datetime.datetime.utcnow()
    trip.is_active = False
    trip.is_finished = True
    trip.completed_at = now
    trip.updated_at = now
    db.commit()
    trip_logger.info("Trip deactivated (finished)", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"success": True}


@router.patch("/{trip_id}/budget", response_model=schemas.UserTripOut)
async def update_trip_budget(
    trip_id: str,
    req: schemas.UpdateTripBudgetRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")
    
    trip.total_budget = req.total_budget
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


@router.patch("/{trip_id}/visited-indices", response_model=schemas.UserTripOut)
async def update_trip_visited_indices(
    trip_id: str,
    req: schemas.UpdateTripVisitedRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")
    
    trip.visited_indices = req.visited_indices
    flag_modified(trip, "visited_indices")
    trip.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    return trip


@router.patch("/{trip_id}/skipped-indices", response_model=schemas.UserTripOut)
async def update_trip_skipped_indices(
    trip_id: str,
    req: schemas.UpdateTripSkippedRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")
    
    trip.skipped_indices = req.skipped_indices
    flag_modified(trip, "skipped_indices")
    trip.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    return trip


@router.patch("/{trip_id}/finalize", response_model=schemas.UserTripOut)
async def finalize_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Conclude the active journey: mark as finished, deactivate, and freeze the record."""
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")

    if trip.is_finished:
        return trip

    now = datetime.datetime.utcnow()
    trip.is_finished = True
    trip.is_active = False
    trip.completed_at = now
    trip.updated_at = now
    db.commit()
    db.refresh(trip)
    trip_logger.info("Trip finalized (Conclude Journey)", extra={"trip_id": trip_id, "user_id": current_user.id})
    return trip


@router.patch("/{trip_id}/archive-spendings", response_model=schemas.UserTripOut)
async def archive_trip_spendings(
    trip_id: str,
    req: schemas.ArchiveSpendingsRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trip = db.query(models.UserTrip).filter(
        models.UserTrip.id == trip_id,
        models.UserTrip.user_id == current_user.id,
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")
    
    trip.archived_spendings = req.spendings
    trip.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}")
async def delete_trip(trip_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trip = db.query(models.UserTrip).filter(models.UserTrip.id == trip_id, models.UserTrip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="We couldn't locate this trip journey. It might have been deleted.")
    
    db.delete(trip)
    db.commit()
    trip_logger.info("TRIP DELETED (Hard)", extra={"trip_id": trip_id, "user_id": current_user.id})
    return {"message": "Trip successfully deleted"}
