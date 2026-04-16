from typing import Optional
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from app import models, auth_utils
from app.database import get_db

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    token_data = auth_utils.decode_access_token(token)
    if not token_data or not token_data.firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(models.User).filter(models.User.firebase_uid == token_data.firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
