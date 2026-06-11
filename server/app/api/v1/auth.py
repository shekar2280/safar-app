import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from firebase_admin import auth as firebase_auth

from app import models, schemas, auth_utils
from app.database import get_db
from app.logger import auth_logger
from app.api.dependencies import get_current_user
from app.rate_limiter import limiter

router = APIRouter()

@router.post("/sync-user", response_model=schemas.SyncUserResponse)
@limiter.limit("10/minute")
async def sync_user(request: Request, body: schemas.SyncUserRequest, db: Session = Depends(get_db)):
    try:
        decoded = firebase_auth.verify_id_token(body.firebase_id_token)
    except Exception as e:
        auth_logger.error("Firebase token verification failed", extra={"error": str(e)})
        raise HTTPException(status_code=401, detail="Your session has expired. Please log in again to continue.")

    firebase_uid = decoded.get("uid")
    email = decoded.get("email")
    full_name = decoded.get("name")
    photo_url = decoded.get("picture")

    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    now = datetime.datetime.utcnow()
    is_new_user = user is None

    if user:
        auth_logger.info("Syncing existing user", extra={
            "firebase_uid": firebase_uid,
            "db_full_name": user.full_name,
            "token_full_name": full_name
        })
        user.last_login = now
        user.updated_at = now
        if email:
            user.email = email
        if full_name and not user.is_name_custom:
            auth_logger.info("Syncing name from token because DB name is not custom")
            user.full_name = full_name
        if photo_url:
            user.photo_url = photo_url
    else:
        user = models.User(
            firebase_uid=firebase_uid,
            email=email,
            full_name=full_name,
            photo_url=photo_url,
            created_at=now,
            last_login=now,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    auth_logger.info(
        "User synced to DB",
        extra={"firebase_uid": firebase_uid, "email": email, "new_user": is_new_user},
    )

    access_token = auth_utils.create_access_token(data={"sub": firebase_uid})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=schemas.UserProfile)
async def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserProfile)
@limiter.limit("15/minute")
async def update_me(
    request: Request,
    body: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    auth_logger.info("PATCH /me received", extra={
        "has_full_name": body.full_name is not None,
        "new_name": body.full_name
    })
    if body.full_name is not None:
        auth_logger.info(f"Manual name update: {body.full_name}")
        current_user.full_name = body.full_name
        db.query(models.User).filter(models.User.id == current_user.id).update(
            {models.User.is_name_custom: True}
        )
    
    current_user.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    auth_logger.info("PATCH finished", extra={
        "db_full_name": current_user.full_name,
        "db_is_name_custom": current_user.is_name_custom
    })
    return current_user


@router.delete("/me")
@limiter.limit("5/minute")
async def delete_me(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Permanently delete the user account and all associated data."""
    auth_logger.info(f"Account deletion initiated for user: {current_user.id}")
    db.delete(current_user)
    db.commit()
    auth_logger.info(f"Account deleted successfully: {current_user.id}")
    return {"status": "success", "message": "Account wiped successfully"}
