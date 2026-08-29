from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed runtime configuration loaded from environment variables only."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="FINCONTROL_",
        extra="ignore",
    )

    app_name: str = "FINCONTROL API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    database_url: str = "postgresql+psycopg://fincontrol:fincontrol@localhost:5432/fincontrol"
    jwt_secret: str = "development-only-secret-change-before-production"
    access_token_minutes: int = 30


@lru_cache
def get_settings() -> Settings:
    return Settings()
