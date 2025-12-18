from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from auth.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# TEMP in-memory store (replace with DB later)
USERS = {}

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def signup(payload: SignupRequest):
    if payload.email in USERS:
        raise HTTPException(status_code=400, detail="User already exists")

    USERS[payload.email] = hash_password(payload.password)
    return {"message": "Account created"}

@router.post("/login")
def login(payload: LoginRequest):
    hashed = USERS.get(payload.email)
    if not hashed or not verify_password(payload.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": payload.email})
    return {"access_token": token, "token_type": "bearer"}
