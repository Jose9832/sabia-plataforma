from fastapi import APIRouter, status

from app.core.deps import DbDep, UsuarioDep
from app.schemas.auth import LoginIn, RegistroIn, TokenOut, UsuarioOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/registro", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def registro(datos: RegistroIn, db: DbDep):
    """Crea la cuenta (contraseña con bcrypt) y devuelve un JWT para entrar de una vez."""
    return auth_service.registrar(db, datos)


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: DbDep):
    """Ingreso con número de identificación y contraseña. Valida que la cuenta sea de la comunidad elegida."""
    return auth_service.autenticar(db, datos)


@router.get("/yo", response_model=UsuarioOut)
def yo(usuario: UsuarioDep):
    return usuario
