"""Dependencias de FastAPI: sesión de base de datos y usuario autenticado."""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decodificar_token
from app.models import Usuario

bearer = HTTPBearer(auto_error=False)

DbDep = Annotated[Session, Depends(get_db)]


def _usuario_desde_token(db: Session, cred: HTTPAuthorizationCredentials | None) -> Usuario | None:
    if not cred:
        return None
    payload = decodificar_token(cred.credentials)
    if not payload or "sub" not in payload:
        return None
    return db.get(Usuario, int(payload["sub"]))


def usuario_opcional(
    db: DbDep, cred: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]
) -> Usuario | None:
    return _usuario_desde_token(db, cred)


def usuario_actual(
    db: DbDep, cred: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]
) -> Usuario:
    usuario = _usuario_desde_token(db, cred)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Entra con tu cuenta para continuar.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return usuario


UsuarioDep = Annotated[Usuario, Depends(usuario_actual)]
UsuarioOpcionalDep = Annotated[Usuario | None, Depends(usuario_opcional)]
