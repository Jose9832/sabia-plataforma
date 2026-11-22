"""Operaciones de la demostración (separadas de los routers y de la carga de datos)."""
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Usuario
from app.services.comun import ErrorNegocio


def reiniciar_demostracion(db: Session, usuario: Usuario) -> None:
    """Restablece los datos demo. Solo con perfiles demo activos y solo el administrador técnico."""
    if not settings.ENABLE_DEMO_PROFILES:
        raise ErrorNegocio("La demostración está deshabilitada en este entorno.", 403)
    if not usuario.is_technical_admin:
        raise ErrorNegocio("Solo el administrador técnico puede restablecer la demostración.", 403)
    from app.seed import reiniciar_aluna  # import tardío: el seed carga archivos grandes

    reiniciar_aluna(db)
