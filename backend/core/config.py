# backend/core/config.py

from functools import lru_cache
from typing import List

from pydantic import BaseSettings, AnyHttpUrl


class Settings(BaseSettings):
    APP_NAME: str = "InfraGenie API"
    APP_VERSION: str = "0.1.0"

    # CORS origins – you can override via environment variable later
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://getinfragenie.com",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance so we don't re-parse env on every import.
    """
    return Settings()
