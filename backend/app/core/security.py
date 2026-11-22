"""Hash de contraseñas (bcrypt) y tokens JWT.

Se usa bcrypt directamente (passlib ya no tiene mantenimiento). Los hashes existentes
($2b$…) siguen siendo válidos: el formato es el mismo.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings

# bcrypt solo considera los primeros 72 bytes de la contraseña.
_MAX_BYTES = 72


def _bytes(clave: str) -> bytes:
    return clave.encode("utf-8")[:_MAX_BYTES]


def hash_clave(clave: str) -> str:
    return bcrypt.hashpw(_bytes(clave), bcrypt.gensalt(rounds=12)).decode("ascii")


def verificar_clave(clave: str, clave_hash: str | None) -> bool:
    if not clave_hash:
        return False
    try:
        return bcrypt.checkpw(_bytes(clave), clave_hash.encode("ascii"))
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
