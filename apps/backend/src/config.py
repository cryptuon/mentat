"""Application configuration using pydantic-settings."""
from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Mentat Protocol API"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = Field(default=True)
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True

    # Database
    database_url: PostgresDsn = Field(
        default="postgresql://postgres:postgres@localhost:5432/mentat_dev"
    )

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 10

    # Security
    secret_key: str = Field(
        default="dev-secret-key-change-in-production-use-openssl-rand-hex-32"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    cors_origins: list[str] = Field(
        default=[
            "http://localhost:5173",  # Vue dev server
            "http://localhost:3000",  # Alternative frontend
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]
    )

    # AI Services
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None

    # Solana
    solana_rpc_url: str = "https://api.devnet.solana.com"
    solana_ws_url: str = "wss://api.devnet.solana.com"

    # Proof Service
    proof_service_url: str = "http://localhost:8001"

    # Rate Limiting
    rate_limit_per_minute: int = 60


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
