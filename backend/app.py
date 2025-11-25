# backend/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import openai 
# These imports will work once we add the router files
# (routers/generate.py and routers/auth.py)
from routers import generate, auth

openai.api_key = os.getenv("OPENAI_API_KEY")
def create_app() -> FastAPI:
    app = FastAPI(
        title="InfraGenie API",
        version="0.1.0",
        description=(
            "InfraGenie – AI DevOps Copilot for generating CI/CD pipelines, "
            "Dockerfiles, Kubernetes manifests, Helm charts, and GitOps configs."
        ),
    )

    # CORS configuration – update origins as needed
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://getinfragenie.com",
    ]
    app.include_router(generate.router, prefix="/api/generate", tags=["generate"])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check
    @app.get("/healthz", tags=["health"])
    async def health_check():
        return {"status": "ok", "service": "infragenie-api"}

    # Include routers (we’ll create these files next)
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(generate.router, prefix="/api/generate", tags=["generate"])

    return app


app = create_app()
