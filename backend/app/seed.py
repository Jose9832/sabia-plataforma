"""Carga los datos semilla de `database/seeds/` en PostgreSQL.

- aluna_saberes.json → usuarios demo, comunidades, saberes, solicitudes y borradores IA (ALUNA).
- salud_sabia.json   → contenido del módulo de Salud SABIA (relatos, lugares, plantas, alertas…).

Es idempotente: solo llena lo que esté vacío, así que corre en cada arranque del contenedor
(`python -m app.seed`). `reiniciar_aluna()` restablece la demostración desde la API.
"""
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import delete, func, select, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_clave
from app.models import (
    AccessGrant,
    AccessRequest,
    AffiliationRequest,
    AiGeneration,
    AlertaVeredal,
    Approval,
    CanalBienestar,
    Community,
    Comunidad,
    Encuentro,
    HistoriaProducto,
    Investigacion,
    Knowledge,
    KnowledgeOwner,
    Lugar,
    Membership,
    Planta,
    Relato,
    SemillaTrueque,
    Usuario,
    Visibilidad,
)

log = logging.getLogger("aluna.seed")

# Contraseña de los perfiles de demostración (documentada en el README).
CLAVE_DEMO = "aluna2026"
# Qué versión del módulo de Salud SABIA ve cada comunidad (configurable en la tabla communities).
MODULO_SALUD = {
    "comm_sierra": Comunidad.indigena,
    "comm_afro": Comunidad.afro,
    "comm_campesinos": Comunidad.campesina,
    "comm_pescadores": Comunidad.campesina,
    "comm_palafitos": Comunidad.campesina,
}
CAMPOS_PAYLOAD = ("transformMeta", "slides", "chatMessages", "podcastSegments", "conceptNodes", "videoStoryboard")


def _leer(nombre: str) -> dict | None:
    ruta: Path = settings.seeds_dir / nombre
    if not ruta.exists():
        log.warning("No se encontró %s: se omite.", ruta)
        return None
    return json.loads(ruta.read_text(encoding="utf-8"))


def _vacia(db: Session, modelo) -> bool:
    return db.scalar(select(func.count()).select_from(modelo)) == 0


def _ajustar_secuencia(db: Session, tabla: str) -> None:
    db.execute(text(
        f"SELECT setval(pg_get_serial_sequence('{tabla}', 'id'), COALESCE((SELECT MAX(id) FROM {tabla}), 1))"
    ))


# ---------------------------------------------------------------------------
# ALUNA · SABIA & CEIBA
# ---------------------------------------------------------------------------
def _cargar_usuarios_y_comunidades(db: Session, d: dict) -> None:
    for c in d["communities"]:
        if not db.get(Community, c["id"]):
            db.add(Community(
                id=c["id"], name=c["name"], cultural_category=c.get("culturalCategory"), region=c["region"],
                description=c["description"], cultural_context=c["culturalContext"], photo_url=c["photoUrl"],
                tags=c["tags"], custodians=c["custodians"], members_count=c["membersCount"],
                participation_guidelines=c["participationGuidelines"], policies=c["policies"],
                is_demo=c.get("isDemo", True), modulo_salud=MODULO_SALUD.get(c["id"]),
            ))
    db.flush()
    for u in d["users"]:
        existente = db.scalar(select(Usuario).where(Usuario.codigo == u["id"]))
        if not existente:
            db.add(Usuario(
                codigo=u["id"], email=u["email"], nombre=u["name"], identity=u["identity"], role_label=u["roleLabel"],
                avatar=u["avatar"], organization=u.get("organization"), bio=u["bio"], is_demo=True,
                is_technical_admin=bool(u.get("isTechnicalAdmin")), clave_hash=hash_clave(CLAVE_DEMO),
            ))
    db.flush()


def _cargar_membresias(db: Session, d: dict) -> None:
    usuarios = {u.codigo: u for u in db.scalars(select(Usuario))}
    for u in d["users"]:
        for a in u["affiliations"]:
            if a.get("status") in (None, "none"):
                continue
            db.add(Membership(
                user_id=usuarios[u["id"]].id, community_id=a["communityId"], role=a["role"], status=a["status"],
                joined_date=a.get("joinedDate"),
                verified_at=datetime.now(timezone.utc) if a["status"] == "verified" else None,
            ))


def _cargar_contenido_aluna(db: Session, d: dict) -> None:
    usuarios = {u.codigo: u for u in db.scalars(select(Usuario))}
    for i, k in enumerate(d["knowledges"]):
        autor = usuarios.get(k["authorUserId"])
        db.add(Knowledge(
            id=k["id"], title=k["title"], type=k["type"], author=k["author"], author_role=k["authorRole"],
            created_by=autor.id if autor else None, author_codigo=k["authorUserId"],
            is_collective=k["isCommunityCollectiveKnowledge"], date=k["date"], description=k["description"],
            excerpt_for_public=k.get("excerptForPublic"), full_content=k["fullContent"], media_url=k.get("mediaUrl"),
            audio_url=k.get("audioUrl"), video_url=k.get("videoUrl"), audio_duration=k.get("audioDuration"),
            tags=k["tags"], status=k["status"], permissions=k["permissions"], educational_data=k["educationalData"],
            authorized_user_ids=k.get("authorizedUserIds", []), is_demo=True,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=i),  # conserva el orden del prototipo
        ))
        for pos, cid in enumerate(k["communityIds"]):
            db.add(KnowledgeOwner(knowledge_id=k["id"], community_id=cid, position=pos))
        for a in k["approvals"]:
            custodio = usuarios.get(a.get("custodianId") or "")
            db.add(Approval(
                knowledge_id=k["id"], community_id=a["communityId"], community_name=a["communityName"],
                custodian_user_id=custodio.id if custodio else None, custodian_codigo=a.get("custodianId"),
                custodian_name=a.get("custodianName"), status=a["status"], note=a.get("note"),
                decision_date=a.get("decisionDate"),
            ))
        for g in k.get("accessGrants") or []:
            if g["userId"] in usuarios:
                db.add(AccessGrant(id=g["id"], knowledge_id=k["id"], user_id=usuarios[g["userId"]].id,
                                   granted_by=usuarios[g["grantedByCustodianId"]].id if g.get("grantedByCustodianId") in usuarios else None))
    db.flush()
    for i, r in enumerate(d["accessRequests"]):
        db.add(AccessRequest(
            id=r["id"], knowledge_id=r["knowledgeId"], requester_id=usuarios[r["userId"]].id, community_id=r["communityId"],
            purpose=r["purpose"], requested_permissions=r["requestedPermissions"], status=r["status"],
            request_date=r["requestDate"], response_date=r.get("responseDate"), response_note=r.get("responseNote"),
            custodian_user_id=usuarios[r["custodianId"]].id if r.get("custodianId") in usuarios else None,
            created_at=datetime.now(timezone.utc) - timedelta(hours=1 + i),
        ))
    for i, a in enumerate(d["affiliationRequests"]):
        db.add(AffiliationRequest(
            id=a["id"], user_id=usuarios[a["userId"]].id, community_id=a["communityId"], rationale=a["rationale"],
            status=a["status"], request_date=a["requestDate"], response_note=a.get("responseNote"),
            created_at=datetime.now(timezone.utc) - timedelta(hours=1 + i),
        ))
    for i, g in enumerate(d["aiArtifacts"]):
        db.add(AiGeneration(
            id=g["id"], user_id=usuarios[g["authorUserId"]].id, knowledge_id=g["knowledgeId"],
            community_ids=g["communityIds"], community_name=g["communityName"], type=g["type"], title=g["title"],
            summary=g.get("summary", ""), generated_at=g["generatedAt"], status=g["status"], public=bool(g.get("public")),
            custodian_feedback=g.get("custodianFeedback"), payload={c: g[c] for c in CAMPOS_PAYLOAD if c in g},
            created_at=datetime.now(timezone.utc) - timedelta(hours=1 + i),
        ))
    for w in d["wellnessItems"]:
        if not db.get(CanalBienestar, w["id"]):
            db.add(CanalBienestar(id=w["id"], category=w["category"], title=w["title"], description=w["description"],
                                  community_target=w["communityTarget"], channel_info=w["channelInfo"], status=w["status"]))


def cargar_aluna(db: Session, d: dict) -> dict[str, int]:
    resumen: dict[str, int] = {}
    if _vacia(db, Community) or _vacia(db, Usuario) or not db.scalar(select(func.count()).select_from(Usuario).where(Usuario.is_demo.is_(True))):
        _cargar_usuarios_y_comunidades(db, d)
        resumen.update(usuarios=len(d["users"]), comunidades=len(d["communities"]))
    if _vacia(db, Membership):
        _cargar_membresias(db, d)
    if _vacia(db, Knowledge):
        _cargar_contenido_aluna(db, d)
        resumen.update(saberes=len(d["knowledges"]), solicitudes=len(d["accessRequests"]),
                       derivados_ia=len(d["aiArtifacts"]), canales_bienestar=len(d["wellnessItems"]))
    return resumen


def reiniciar_aluna(db: Session) -> None:
    """Restablece la demostración: saberes, solicitudes, derivados y membresías de los perfiles demo."""
    d = _leer("aluna_saberes.json")
    if not d:
        return
    for modelo in (AiGeneration, AccessGrant, AccessRequest, AffiliationRequest, Approval, KnowledgeOwner, Knowledge):
        db.execute(delete(modelo))
    demo = select(Usuario.id).where(Usuario.is_demo.is_(True))
    db.execute(delete(Membership).where(Membership.user_id.in_(demo)))
    db.flush()
    _cargar_membresias(db, d)
    _cargar_contenido_aluna(db, d)
    db.commit()


# ---------------------------------------------------------------------------
# Módulo de Salud SABIA
# ---------------------------------------------------------------------------
def cargar_salud(db: Session, d: dict) -> dict[str, int]:
    resumen: dict[str, int] = {}
    if _vacia(db, Relato):
        for r in d["relatos"]:
            db.add(Relato(**{**r, "comunidad": Comunidad(r["comunidad"]), "visibilidad": Visibilidad(r["visibilidad"])}))
        db.flush()
        _ajustar_secuencia(db, "relatos")
        resumen["relatos"] = len(d["relatos"])
    if _vacia(db, Lugar):
        for lugar in d["lugares"]:
            db.add(Lugar(**lugar))
        db.flush()
        _ajustar_secuencia(db, "lugares")
        resumen["lugares"] = len(d["lugares"])
    if _vacia(db, Planta):
        for p in d["plantas"]:
            db.add(Planta(**{**p, "comunidad": Comunidad(p["comunidad"])}))
        resumen["plantas"] = len(d["plantas"])
    if _vacia(db, HistoriaProducto):
        for h in d["historias"]:
            db.add(HistoriaProducto(**{**h, "comunidad": Comunidad(h["comunidad"]), "visibilidad": Visibilidad.afuera}))
        db.flush()
        _ajustar_secuencia(db, "historias_producto")
        resumen["historias"] = len(d["historias"])
    if _vacia(db, Encuentro):
        for e in d["encuentros"]:
            db.add(Encuentro(**{**e, "comunidad": Comunidad(e["comunidad"]), "visibilidad": Visibilidad(e["visibilidad"])}))
        db.flush()
        _ajustar_secuencia(db, "encuentros")
        resumen["encuentros"] = len(d["encuentros"])
    if _vacia(db, Investigacion):
        for i in d["investigaciones"]:
            db.add(Investigacion(**i))
        db.flush()
        _ajustar_secuencia(db, "investigaciones")
        resumen["investigaciones"] = len(d["investigaciones"])
    if _vacia(db, SemillaTrueque):
        for s in d["semillas"]:
            db.add(SemillaTrueque(**s, es_ejemplo=True))
        db.flush()
        _ajustar_secuencia(db, "semillas_trueque")
        resumen["semillas"] = len(d["semillas"])
    if _vacia(db, AlertaVeredal):
        ahora = datetime.now(timezone.utc)
        for a, hace in zip(d["alertas"], [timedelta(hours=2), timedelta(days=1), timedelta(days=3)], strict=False):
            db.add(AlertaVeredal(**a, sincronizado_en=ahora - hace))
        db.flush()
        _ajustar_secuencia(db, "alertas_veredales")
        resumen["alertas"] = len(d["alertas"])
    return resumen


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    resumen: dict[str, int] = {}
    with SessionLocal() as db:
        if aluna := _leer("aluna_saberes.json"):
            resumen.update(cargar_aluna(db, aluna))
        if salud := _leer("salud_sabia.json"):
            resumen.update({f"salud.{k}": v for k, v in cargar_salud(db, salud).items()})
        db.commit()
    log.info("Datos semilla cargados: %s", ", ".join(f"{k}={v}" for k, v in resumen.items()) or "nada nuevo")


if __name__ == "__main__":
    main()
