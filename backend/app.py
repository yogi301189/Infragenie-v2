# backend/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import generate, auth
# app.py





def create_app() -> FastAPI:
    app = FastAPI(
        title="InfraScribe API",
        version="0.1.0",
        description=(
            "InfraScribe – AI DevOps Copilot for generating CI/CD pipelines, "
            "Dockerfiles, Kubernetes manifests, Helm charts, and GitOps configs."
        ),
    )

    # CORS configuration – update origins as needed
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://app.getinfragenie.com",
        "https://infragenie-devops.vercel.app",  # Vercel frontend
        "https://getinfragenie.com",   
        "https://infrascribe.dev",
        "https://www.infrascribe.dev",          # your custom domain (if used)
        # "https://www.getinfragenie.com",       # add this if you use www
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Simple root route
    @app.get("/")
    async def read_root():
        return {"message": "InfraScribe backend is running 🚀"}

    # Health check
    @app.get("/healthz", tags=["health"])
    async def health_check():
        return {"status": "ok", "service": "infrascribe-api"}

    # Include routers
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(generate.router, prefix="/api/generate", tags=["generate"])

    return app


app = create_app()
app.include_router(billing.router)
app.include_router(stripe_webhook.router)