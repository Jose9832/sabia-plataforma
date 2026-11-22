"""API REST v1 de ALUNA (SABIA & CEIBA) — contrato acordado con el equipo.

Toda decisión de permisos se toma aquí, en el servidor: el frontend solo la refleja.
"""
from fastapi import APIRouter, status

from app.core.config import settings
from app.core.deps import DbDep, UsuarioDep, UsuarioOpcionalDep
from app.schemas.aluna import (
    ConsultaCeibaIn,
    Decision,
    DerivadoIn,
    LoginIn,
    OrientacionIn,
    RegistroIn,
    SaberIn,
    SolicitudAccesoIn,
    TransformarIn,
    VinculacionIn,
)
from app.services import aluna_service as svc
from app.services import auth_service
from app.services.comun import ErrorNegocio

auth = APIRouter(prefix="/auth", tags=["Autenticación"])
saberes = APIRouter(tags=["SABIA · Saberes y comunidades"])
custodia = APIRouter(tags=["Custodia y accesos"])
ia = APIRouter(prefix="/ai", tags=["CEIBA · IA"])
bienestar = APIRouter(prefix="/wellness", tags=["Bienestar"])
sistema = APIRouter(tags=["Sistema"])


# ---------- Autenticación ----------
@auth.post("/login")
def login(datos: LoginIn, db: DbDep):
    return auth_service.iniciar_sesion(db, datos.email, datos.password)


@auth.post("/register", status_code=status.HTTP_201_CREATED)
def registro(datos: RegistroIn, db: DbDep):
    """Crea la cuenta. Si eligió comunidad, la filiación queda *pendiente* hasta que su custodia la valide."""
    return auth_service.registrar(db, datos.model_dump())


@auth.post("/demo/{codigo}")
def entrar_demo(codigo: str, db: DbDep):
    """Perfiles de la demostración (Sofía, Carlos, Aura, Mamo Senen, Faustina, Patrón Marino)."""
    return auth_service.entrar_como_demo(db, codigo)


@auth.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout():
    """El JWT vive en el cliente: cerrar sesión es descartarlo."""


@sistema.get("/me")
def yo(usuario: UsuarioDep):
    return svc.usuario_dict(usuario)


@sistema.get("/bootstrap")
def bootstrap(db: DbDep, usuario: UsuarioOpcionalDep):
    """Estado inicial completo de la app, ya filtrado por los permisos de la persona."""
    return svc.bootstrap(db, usuario, settings.ENABLE_DEMO_PROFILES)


@sistema.post("/demo/reset")
def reiniciar_demo(db: DbDep, usuario: UsuarioDep):
    """Restablece los datos de la demostración (solo con perfiles demo habilitados)."""
    if not settings.ENABLE_DEMO_PROFILES:
        raise ErrorNegocio("La demostración está deshabilitada en este entorno.", 403)
    from app.seed import reiniciar_aluna

    reiniciar_aluna(db)
    return {"ok": True}


# ---------- Comunidades y saberes ----------
@saberes.get("/communities")
def comunidades(db: DbDep):
    return svc.listar_comunidades(db)


@saberes.get("/communities/{community_id}")
def comunidad(community_id: str, db: DbDep):
    for c in svc.listar_comunidades(db):
        if c["id"] == community_id:
            return c
    raise ErrorNegocio("La comunidad no existe.", 404)


@saberes.get("/knowledges")
def listar_saberes(db: DbDep, usuario: UsuarioOpcionalDep):
    """Catálogo: lo aprobado + tus aportes + lo que custodias. Sin permiso de lectura no viaja el contenido."""
    return svc.listar_saberes(db, usuario)


@saberes.get("/knowledges/{knowledge_id}")
def obtener_saber(knowledge_id: str, db: DbDep, usuario: UsuarioOpcionalDep):
    return svc.obtener_saber(db, usuario, knowledge_id)


@saberes.post("/knowledges", status_code=status.HTTP_201_CREATED)
def proponer_saber(datos: SaberIn, db: DbDep, usuario: UsuarioDep):
    out = svc.proponer_saber(db, usuario, datos.model_dump())
    db.commit()
    return out


@saberes.post("/knowledges/{knowledge_id}/access-requests", status_code=status.HTTP_201_CREATED)
def solicitar_acceso(knowledge_id: str, datos: SolicitudAccesoIn, db: DbDep, usuario: UsuarioDep):
    perms = datos.requestedPermissions.model_dump() if datos.requestedPermissions else None
    out = svc.solicitar_acceso(db, usuario, knowledge_id, datos.purpose, perms, datos.id)
    db.commit()
    return out


@saberes.post("/knowledges/{knowledge_id}/decisions")
def decidir_saber(knowledge_id: str, datos: Decision, db: DbDep, usuario: UsuarioDep):
    """Cada custodia aprueba por su comunidad; el saber mancomunado se publica con el consenso de todas."""
    if not datos.communityId:
        raise ErrorNegocio("Indica la comunidad en nombre de la cual decides.", 422)
    out = svc.decidir_saber(db, usuario, knowledge_id, datos.communityId, datos.decision == "approve", datos.note)
    db.commit()
    return out


@saberes.post("/permissions/{knowledge_id}/grant-ai")
def habilitar_ia(knowledge_id: str, db: DbDep, usuario: UsuarioDep):
    out = svc.cambiar_permiso_ia(db, usuario, knowledge_id, True)
    db.commit()
    return out


@saberes.post("/permissions/{knowledge_id}/revoke")
def revocar_ia(knowledge_id: str, db: DbDep, usuario: UsuarioDep):
    out = svc.cambiar_permiso_ia(db, usuario, knowledge_id, False)
    db.commit()
    return out


# ---------- Custodia, accesos y vinculaciones ----------
@custodia.get("/access-requests/me")
def mis_solicitudes(db: DbDep, usuario: UsuarioDep):
    return [r for r in svc.listar_solicitudes(db, usuario) if r["userId"] == usuario.codigo]


@custodia.get("/custody/review-queue")
def bandeja_custodia(db: DbDep, usuario: UsuarioDep):
    return svc.cola_de_custodia(db, usuario)


@custodia.post("/access-requests/{request_id}/decisions")
def decidir_acceso(request_id: str, datos: Decision, db: DbDep, usuario: UsuarioDep):
    out = svc.decidir_acceso(db, usuario, request_id, datos.decision == "approve", datos.note)
    db.commit()
    return out


@custodia.post("/affiliations", status_code=status.HTTP_201_CREATED)
def solicitar_vinculacion(datos: VinculacionIn, db: DbDep, usuario: UsuarioDep):
    out = svc.solicitar_vinculacion(db, usuario, datos.communityId, datos.rationale, datos.id)
    db.commit()
    return out


@custodia.post("/affiliations/{aff_id}/decisions")
def decidir_vinculacion(aff_id: str, datos: Decision, db: DbDep, usuario: UsuarioDep):
    out = svc.decidir_vinculacion(db, usuario, aff_id, datos.decision == "approve", datos.note)
    db.commit()
    return out


# ---------- CEIBA ----------
@ia.post("/query")
def consultar(datos: ConsultaCeibaIn, db: DbDep, usuario: UsuarioDep):
    """Consulta asistida con citas. Autoriza antes de recuperar y nunca inventa."""
    out = svc.consultar_ceiba(db, usuario, datos.knowledgeIds, datos.question)
    db.commit()
    return out


@ia.post("/transform", status_code=status.HTTP_201_CREATED)
def transformar(datos: TransformarIn, db: DbDep, usuario: UsuarioDep):
    """«Transformar para enseñar»: el resultado nace como borrador pendiente de la custodia."""
    pedido = datos.model_dump(exclude={"id", "knowledgeIds"})
    out = svc.transformar_con_ceiba(db, usuario, datos.knowledgeIds[0], pedido, datos.id)
    db.commit()
    return out


@ia.post("/outputs", status_code=status.HTTP_201_CREATED)
def guardar_derivado(datos: DerivadoIn, db: DbDep, usuario: UsuarioDep):
    out = svc.guardar_derivado(db, usuario, datos.model_dump())
    db.commit()
    return out


@ia.get("/outputs/{output_id}")
def obtener_derivado(output_id: str, db: DbDep, usuario: UsuarioDep):
    for d in svc.listar_derivados(db, usuario):
        if d["id"] == output_id:
            return d
    raise ErrorNegocio("El borrador no existe.", 404)


@ia.post("/outputs/{output_id}/decisions")
def decidir_derivado(output_id: str, datos: Decision, db: DbDep, usuario: UsuarioDep):
    out = svc.decidir_derivado(db, usuario, output_id, datos.decision == "approve", datos.note)
    db.commit()
    return out


# ---------- Bienestar ----------
@bienestar.get("/channels")
def canales(db: DbDep):
    return svc.bootstrap(db, None, False)["wellnessItems"]


@bienestar.post("/orientations", status_code=status.HTTP_201_CREATED)
def orientacion(datos: OrientacionIn, db: DbDep, usuario: UsuarioDep):
    """Solicitud orientativa no clínica: se guarda aparte y nunca entra a Ceiba."""
    out = svc.registrar_orientacion(db, usuario, datos.description, datos.channelId)
    db.commit()
    return out


routers = [auth, sistema, saberes, custodia, ia, bienestar]
