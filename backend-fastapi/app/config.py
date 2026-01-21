from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/notes_tasks_db"

    # JWT
    jwt_secret_key: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7

    # Server
    host: str = "0.0.0.0"
    port: int = 5000
    debug: bool = True

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
