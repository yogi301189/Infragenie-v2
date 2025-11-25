# backend/routers/auth.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


class LoginRequest(BaseModel):
    """
    Placeholder login payload.

    If you are using Firebase Auth on the frontend, you can
    later change this to accept an ID token and verify it here.
    """
    email: str
    password: str


class LoginResponse(BaseModel):
    message: str
    access_token: str | None = None  # later you can return a real JWT


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    """
    Dummy login endpoint (for now).

    - Always returns success.
    - Exists so frontend can be wired easily.
    - Replace with real auth when needed.
    """
    logger.info(f"Login attempt for email={payload.email}")

    # TODO: Replace with real authentication logic
    # For now, just return a fake token
    fake_token = "demo-token-not-secure"

    return LoginResponse(
        message="Login simulated. Replace with real auth later.",
        access_token=fake_token,
    )


@router.get("/me")
async def get_me():
    """
    Dummy user info endpoint.
    In a real-world app, this would extract the user from a JWT.
    """
    # TODO: Integrate with real auth / Firebase / JWT
    return {
        "id": "demo-user",
        "email": "demo@infragenie.dev",
        "name": "InfraGenie Demo User",
    }
