"""Database configuration and lifecycle management."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import RegisterTortoise

from src.config import get_settings

settings = get_settings()


TORTOISE_ORM = {
    "connections": {
        "default": str(settings.database_url).replace("postgresql://", "postgres://")
    },
    "apps": {
        "models": {
            "models": [
                "src.models.user",
                "src.models.market",
                "src.models.curation",
                "aerich.models",
            ],
            "default_connection": "default",
        }
    },
    "use_tz": True,
    "timezone": "UTC",
}


async def init_db() -> None:
    """Initialize database connection."""
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()


async def close_db() -> None:
    """Close database connections."""
    await Tortoise.close_connections()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Database lifecycle manager for FastAPI."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def register_tortoise(app: FastAPI) -> None:
    """Register TortoiseORM with FastAPI app."""
    RegisterTortoise(
        app,
        config=TORTOISE_ORM,
        generate_schemas=True,
        add_exception_handlers=True,
    )
