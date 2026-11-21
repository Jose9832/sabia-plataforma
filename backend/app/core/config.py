"""Configuración de la aplicación leída desde variables de entorno (.env)."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "SABIA API"
    DATABASE_URL: str = "postgresql+psycopg://sabia:sabia_local@localhost:5432/sabia"
    SECRET_KEY: str = "cambia-esta-clave-en-produccion"
    JWT_ALGORITHM: str = "HS256"
    # 30 días: en la vereda puede pasar mucho tiempo sin señal para renovar el token.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080"
    SEED_ON_START: bool = True
    SEED_FILE: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def seed_path(self) -> Path:
        if self.SEED_FILE:
            return Path(self.SEED_FILE)
        # Desarrollo local: <repo>/datos/semilla.json
        return Path(__file__).resolve().parents[3] / "datos" / "semilla.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
