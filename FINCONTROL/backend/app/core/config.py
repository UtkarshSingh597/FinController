from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed runtime configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )

    app_name: str = Field(default="Artha (अर्थ) API", validation_alias=AliasChoices("FINCONTROL_APP_NAME", "APP_NAME"))
    environment: str = Field(default="development", validation_alias=AliasChoices("FINCONTROL_ENVIRONMENT", "ENVIRONMENT"))
    api_v1_prefix: str = Field(default="/api/v1", validation_alias=AliasChoices("FINCONTROL_API_V1_PREFIX", "API_V1_PREFIX"))
    cors_origins: list[str] = Field(default_factory=lambda: ["*"], validation_alias=AliasChoices("FINCONTROL_CORS_ORIGINS", "CORS_ORIGINS"))
    database_url: str = Field(
        default="postgresql+psycopg://fincontrol_user:fincontrol_secret_pass@postgres:5432/fincontrol",
        validation_alias=AliasChoices("FINCONTROL_DATABASE_URL", "DATABASE_URL"),
    )
    jwt_secret: str = Field(
        default="fincontrol_dev_super_secret_jwt_key_2026",
        validation_alias=AliasChoices("FINCONTROL_JWT_SECRET", "JWT_SECRET", "JWT_SECRET_KEY"),
    )
    access_token_minutes: int = Field(default=1440, validation_alias=AliasChoices("FINCONTROL_ACCESS_TOKEN_MINUTES", "ACCESS_TOKEN_MINUTES"))


@lru_cache
def get_settings() -> Settings:
    return Settings()

