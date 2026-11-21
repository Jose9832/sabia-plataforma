from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import crear_token, hash_clave, verificar_clave
from app.models import Usuario
from app.schemas.auth import LoginIn, RegistroIn, TokenOut, UsuarioOut
from app.services.comun import ErrorNegocio

NOMBRES_COMUNIDAD = {"indigena": "Indígena", "afro": "Afrodescendiente", "campesina": "Campesina"}


def _token_para(usuario: Usuario) -> TokenOut:
    token = crear_token(str(usuario.id), {"comunidad": usuario.comunidad.value})
    return TokenOut(access_token=token, usuario=UsuarioOut.model_validate(usuario))


def registrar(db: Session, datos: RegistroIn) -> TokenOut:
    existe = db.scalar(select(Usuario).where(Usuario.numero_identificacion == datos.numero_identificacion))
    if existe:
        raise ErrorNegocio("Ya existe una cuenta con ese número. Usa «Ingresar».", 409)
    usuario = Usuario(
        numero_identificacion=datos.numero_identificacion,
        nombre=datos.nombre,
        comunidad=datos.comunidad,
        clave_hash=hash_clave(datos.clave),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return _token_para(usuario)


def autenticar(db: Session, datos: LoginIn) -> TokenOut:
    usuario = db.scalar(select(Usuario).where(Usuario.numero_identificacion == datos.numero_identificacion))
    if not usuario or not verificar_clave(datos.clave, usuario.clave_hash):
        raise ErrorNegocio("El número o la contraseña no coinciden. Revisa e intenta otra vez.", 401)
    if datos.comunidad and usuario.comunidad != datos.comunidad:
        nombre = NOMBRES_COMUNIDAD[usuario.comunidad.value]
        raise ErrorNegocio(
            f"Esta cuenta pertenece a la comunidad {nombre}. Cambia de comunidad para entrar.", 403
        )
    return _token_para(usuario)
