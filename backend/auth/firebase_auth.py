from fastapi import Depends, HTTPException, status, Header
from firebase_admin import auth

def get_firebase_user(
    authorization: str | None = Header(default=None),
):
    if not authorization:
        return None  # Guest user

    try:
        token = authorization.replace("Bearer ", "")
        decoded = auth.verify_id_token(token)
        return decoded  # contains uid, email, etc
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token",
        )
