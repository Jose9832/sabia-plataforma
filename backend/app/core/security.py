"""Hash de contraseñas (passlib + bcrypt) y tokens JWT."""
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_clave(clave: str) -> str:
    return pwd_context.hash(clave)


def verificar_clave(clave: str, clave_hash: str) -> bool:
    try:
        return pwd_context.verify(clave, clave_hash)
    except ValueError:
        return False


def crear_token(sub: str, extra: dict | None = None) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        **(extra or {}),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decodificar_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
