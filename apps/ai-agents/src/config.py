"""Configuration for AI agents service."""
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """AI agents configuration with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Mentat AI Agents"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = True

    # AI Services
    openai_api_key: str = Field(default="")
    anthropic_api_key: str = Field(default="")
    default_model: str = "gpt-4-turbo-preview"
    default_provider: Literal["openai", "anthropic"] = "openai"

    # Model configuration
    temperature: float = 0.7
    max_tokens: int = 2000

    # Agent-specific settings
    scout_max_sources: int = 5
    validator_min_quality_score: float = 0.7
    validator_min_safety_score: float = 0.8

    # Backend API
    backend_api_url: str = "http://localhost:8000"
    backend_api_key: str | None = None  # For service-to-service auth

    # Redis (for job queue)
    redis_url: str = "redis://localhost:6379/1"

    # Logging
    log_level: str = "INFO"
    log_format: str = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
