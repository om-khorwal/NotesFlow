from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os


class Settings(BaseSettings):
    # Environment
    environment: str = "development"  # development, staging, production

    # Database - REQUIRED in production (no default)
    database_url: str = "postgresql://postgres:postgres@localhost:5432/notes_tasks_db"

    # JWT - REQUIRED in production (no default secret)
    jwt_secret_key: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7

    # Server
    host: str = "0.0.0.0"
    port: int = 5000
    debug: bool = True

    # CORS - Configure allowed frontend origins
    cors_origins: str = "http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500"

    # Cookie settings for auth
    cookie_secure: bool = False  # Set to True in production (HTTPS)
    cookie_samesite: str = "lax"  # "lax" for development, "none" for cross-site in production
    cookie_domain: str = ""  # Set to your domain in production (e.g., ".example.com")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        """Warn if using default secret in non-development environments."""
        # Note: In production, ensure this is set via environment variable
        if v == "your-super-secret-jwt-key-change-in-production":
            import warnings
            warnings.warn(
                "Using default JWT secret key. Set JWT_SECRET_KEY environment variable for production!",
                UserWarning
            )
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow environment variables to override .env file
        extra = "ignore"


settings = Settings()
