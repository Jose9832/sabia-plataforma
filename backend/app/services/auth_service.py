"""Autenticación única de la plataforma (ALUNA + módulo de Salud SABIA)."""
import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import crear_token, hash_clave, verificar_clave
from app.models import Usuario
from app.services import aluna_service
from app.services.comun import ErrorNegocio

ETIQUETAS_IDENTIDAD = {
    "visitor": "Visitante General",
    "student": "Estudiante",
    "researcher": "Investigador/a",
    "community_member": "Integrante comunitario (por verificar)",
    "org_representative": "Representante de organización",
}
# Versión del texto de autorización que se muestra al registrarse (debe coincidir con el frontend).
# Si cambia el texto, sube la versión: queda guardada junto a la fecha de cada autorización.
VERSION_POLITICA_DATOS = "2026-11-v1"
CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def sesion_para(usuario: Usuario) -> dict:
    return {
        "access_token": crear_token(str(usuario.id), {"codigo": usuario.codigo}),
        "token_type": "bearer",
        "user": aluna_service.usuario_dict(usuario),
    }


def iniciar_sesion(db: Session, email: str, clave: str) -> dict:
    u = db.scalar(select(Usuario).where(func.lower(Usuario.email) == email.strip().lower()))
    if not u or not verificar_clave(clave, u.clave_hash):
        raise ErrorNegocio("El correo o la contraseña no coinciden. Verifica tus datos e inténtalo de nuevo.", 401)
    return sesion_para(u)


def entrar_como_demo(db: Session, codigo: str) -> dict:
    """Selector rápido de perfiles de la demostración (se apaga con ENABLE_DEMO_PROFILES=false)."""
    if not settings.ENABLE_DEMO_PROFILES:
        raise ErrorNegocio("Los perfiles de demostración están deshabilitados en este entorno.", 403)
    u = db.scalar(select(Usuario).where(Usuario.codigo == codigo, Usuario.is_demo.is_(True)))
    if not u:
        raise ErrorNegocio("Ese perfil de demostración no existe.", 404)
    return sesion_para(u)


def registrar(db: Session, datos: dict) -> dict:
    nombre = (datos.get("name") or "").strip()
    email = (datos.get("email") or "").strip().lower()
    clave = datos.get("password") or ""
    identidad = datos.get("identity") or "visitor"
    # La autorización debe ser previa, expresa e informada (Ley 1581 de 2012): no se asume ni se omite.
    if datos.get("acceptDataPolicy") is not True:
        raise ErrorNegocio("Para crear tu cuenta debes autorizar el tratamiento de tus datos personales.", 422)
    if len(nombre) < 3:
        raise ErrorNegocio("Escribe tu nombre completo.", 422)
    if not CORREO.match(email):
        raise ErrorNegocio("Escribe un correo electrónico válido.", 422)
    if len(clave) < 8:
        raise ErrorNegocio("La contraseña debe tener al menos 8 caracteres.", 422)
    if identidad not in ETIQUETAS_IDENTIDAD:
        raise ErrorNegocio("Identidad de participación no válida.", 422)
    if db.scalar(select(Usuario).where(func.lower(Usuario.email) == email)):
        raise ErrorNegocio("Ya existe una cuenta con ese correo. Inicia sesión.", 409)

    u = Usuario(
        codigo=f"user_{uuid.uuid4().hex[:12]}", email=email, nombre=nombre, identity=identidad,
        role_label=ETIQUETAS_IDENTIDAD[identidad], avatar="/assets/logos/aluna_isotipo.png", organization=(datos.get("organization") or None),
        bio=(datos.get("bio") or "").strip(), is_demo=False, clave_hash=hash_clave(clave),
        consentimiento_datos_en=datetime.now(timezone.utc), consentimiento_version=VERSION_POLITICA_DATOS,
    )
    db.add(u)
    db.flush()
    # La filiación nunca se auto-verifica: queda pendiente hasta que la custodia de esa comunidad la valide.
    if datos.get("communityId"):
        aluna_service.solicitar_vinculacion(db, u, datos["communityId"], datos.get("rationale") or "", None)
    db.commit()
    db.refresh(u)
    return sesion_para(u)
