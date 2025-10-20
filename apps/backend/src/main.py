"""Main FastAPI application for Mentat Protocol backend."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.database import close_db, init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

# CORS middleware for web and mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment,
    }


# Import and include API routers
from src.api.v1 import auth, curator, drafts, markets  # noqa: E402

app.include_router(auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["auth"])
app.include_router(
    markets.router, prefix=f"{settings.api_v1_prefix}/markets", tags=["markets"]
)
app.include_router(drafts.router, prefix=f"{settings.api_v1_prefix}/drafts", tags=["drafts"])
app.include_router(
    curator.router, prefix=f"{settings.api_v1_prefix}/curator", tags=["curator"]
)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Mentat Protocol API",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }
