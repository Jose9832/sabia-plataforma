"""Configuración de la aplicación leída desde variables de entorno (.env)."""
from functools import lru_cache
from pathlib import Path

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


CLAVES_INSEGURAS = {"", "cambia-esta-clave-en-produccion", "changeme", "secret"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "ALUNA IA · SABIA & CEIBA API"
    # "production" activa las comprobaciones estrictas (clave secreta obligatoria, sin documentación pública).
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "postgresql+psycopg://sabia:sabia_local@localhost:5432/sabia"
    SECRET_KEY: str = "cambia-esta-clave-en-produccion"
    JWT_ALGORITHM: str = "HS256"
    # 30 días: en la vereda puede pasar mucho tiempo sin señal para renovar el token.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080"
    SEED_ON_START: bool = True
    # Carpeta con los datos semilla (database/seeds). Vacío = se busca junto al repositorio.
    SEEDS_DIR: str = ""
    # Selector rápido de perfiles demo (Sofía, Carlos, Aura…). En producción: false.
    ENABLE_DEMO_PROFILES: bool = True
    # Contraseña de las cuentas de prueba del equipo evaluador. En producción se genera aparte.
    DEMO_PASSWORD: str = "aluna2026"
    # Documentación interactiva de la API (/api/docs). Vacío = solo fuera de producción.
    ENABLE_DOCS: bool | None = None
    # Intentos de inicio de sesión o registro permitidos por IP en cada ventana de tiempo.
    RATE_LIMIT_AUTH: int = 10
    RATE_LIMIT_WINDOW_SECONDS: int = 300
    # Despliegue en un solo servicio (p. ej. Render): carpeta con el frontend compilado.
    # Vacío = la API no sirve páginas (en Docker Compose las sirve nginx).
    FRONTEND_DIR: str = ""

    @field_validator("DATABASE_URL")
    @classmethod
    def usar_psycopg3(cls, v: str) -> str:
        """Render y Heroku entregan `postgres://…`; SQLAlchemy necesita el driver psycopg 3."""
        for prefijo in ("postgres://", "postgresql://"):
            if v.startswith(prefijo):
                return "postgresql+psycopg://" + v[len(prefijo):]
        return v

    @model_validator(mode="after")
    def exigir_clave_en_produccion(self) -> "Settings":
        """En producción no se arranca con la clave de ejemplo: cualquiera podría firmar tokens."""
        if self.es_produccion and (self.SECRET_KEY in CLAVES_INSEGURAS or len(self.SECRET_KEY) < 32):
            raise ValueError("SECRET_KEY no es segura para producción: usa una clave aleatoria de al menos 32 caracteres.")
        return self

    @property
    def es_produccion(self) -> bool:
        return self.ENVIRONMENT.strip().lower() in ("production", "produccion", "prod")

    @property
    def docs_habilitada(self) -> bool:
        return (not self.es_produccion) if self.ENABLE_DOCS is None else self.ENABLE_DOCS

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def seeds_dir(self) -> Path:
        if self.SEEDS_DIR:
            return Path(self.SEEDS_DIR)
        # Desarrollo local: <repo>/database/seeds
        return Path(__file__).resolve().parents[3] / "database" / "seeds"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
