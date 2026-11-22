"""Reglas de negocio de ALUNA (SABIA & CEIBA).

Cada función recibe el usuario autenticado y aplica la autorización del servidor
(`app.domain.autorizacion`) antes de leer o modificar. La API devuelve los mismos
objetos camelCase que usa el frontend (`frontend/src/types/index.ts`).
"""
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain import autorizacion as az
from app.domain import ceiba
from app.models import (
    AccessGrant,
    AccessRequest,
    AffiliationRequest,
    AiGeneration,
    Approval,
    AuditEvent,
    CanalBienestar,
    Community,
    Knowledge,
    KnowledgeOwner,
    Membership,
    SolicitudOrientacion,
    Usuario,
)
from app.services.comun import HORA_COLOMBIA, ErrorNegocio

Dict = dict[str, Any]
MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"]
ID_VALIDO = re.compile(r"^[A-Za-z0-9_\-]{3,60}$")
CAMPOS_PAYLOAD = ("transformMeta", "slides", "chatMessages", "podcastSegments", "conceptNodes", "videoStoryboard")


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def _ahora() -> datetime:
    return datetime.now(timezone.utc)


def fecha_corta(d: datetime | None = None) -> str:
    """Formato del prototipo (es-CO): «22 nov 2026»."""
    d = (d or _ahora()).astimezone(HORA_COLOMBIA)
    return f"{d.day:02d} {MESES[d.month - 1]} {d.year}"


def fecha_simple(d: datetime | None = None) -> str:
    d = (d or _ahora()).astimezone(HORA_COLOMBIA)
    return f"{d.day}/{d.month}/{d.year}"


def fecha_hora(d: datetime | None = None) -> str:
    d = (d or _ahora()).astimezone(HORA_COLOMBIA)
    hora = d.hour % 12 or 12
    return f"{fecha_corta(d)} {hora:02d}:{d.minute:02d} {'p. m.' if d.hour >= 12 else 'a. m.'}"


def nuevo_id(prefijo: str, propuesto: str | None = None) -> str:
    """Acepta el id generado en el cliente (cola offline idempotente) o crea uno."""
    if propuesto:
        if not ID_VALIDO.match(propuesto):
            raise ErrorNegocio("Identificador no válido.", 422)
        return propuesto
    return f"{prefijo}_{uuid.uuid4().hex[:16]}"


def _sin_nulos(d: Dict) -> Dict:
    return {k: v for k, v in d.items() if v is not None}


def auditar(db: Session, actor: Usuario | None, evento: str, tipo: str, recurso: str | None,
            comunidad: str | None = None, **detalle: Any) -> None:
    db.add(AuditEvent(actor_user_id=actor.id if actor else None, event_type=evento, resource_type=tipo,
                      resource_id=recurso, community_id=comunidad, detail=detalle))


# ---------------------------------------------------------------------------
# Serialización (forma exacta de los tipos del frontend)
# ---------------------------------------------------------------------------
def usuario_dict(u: Usuario) -> Dict:
    return _sin_nulos({
        "id": u.codigo,
        "name": u.nombre,
        "identity": u.identity,
        "roleLabel": u.role_label,
        "avatar": u.avatar,
        "email": u.email or "",
        "organization": u.organization,
        "affiliations": [_sin_nulos({
            "communityId": m.community_id, "communityName": m.community.name, "status": m.status,
            "role": m.role, "joinedDate": m.joined_date,
        }) for m in u.memberships],
        "bio": u.bio,
        "isDemo": u.is_demo,
        "isTechnicalAdmin": u.is_technical_admin or None,
        "saludComunidad": u.comunidad.value if u.comunidad else None,
    })


def comunidad_dict(c: Community) -> Dict:
    return _sin_nulos({
        "id": c.id, "name": c.name, "culturalCategory": c.cultural_category, "region": c.region,
        "description": c.description, "culturalContext": c.cultural_context, "photoUrl": c.photo_url,
        "tags": c.tags, "custodians": c.custodians, "membersCount": c.members_count,
        "participationGuidelines": c.participation_guidelines, "policies": c.policies, "isDemo": c.is_demo,
        "saludModulo": c.modulo_salud.value if c.modulo_salud else None,
    })


def _grant_dict(g: AccessGrant) -> Dict:
    return _sin_nulos({
        "id": g.id, "knowledgeId": g.knowledge_id, "userId": g.user.codigo, "requestId": g.request_id,
        "grantedByCustodianId": g.granter.codigo if g.granter else None,
        "grantedAt": g.granted_at.isoformat() if g.granted_at else _ahora().isoformat(),
        "expiresAt": g.expires_at.isoformat() if g.expires_at else None,
        "revokedAt": g.revoked_at.isoformat() if g.revoked_at else None,
    })


def saber_dict(k: Knowledge) -> Dict:
    """Saber completo (uso interno del servidor para evaluar permisos)."""
    return _sin_nulos({
        "id": k.id, "title": k.title, "type": k.type,
        "communityIds": [o.community_id for o in k.owners],
        "communityNames": [o.community.name for o in k.owners],
        "author": k.author, "authorRole": k.author_role,
        "authorUserId": k.creator.codigo if k.creator else k.author_codigo,
        "isCommunityCollectiveKnowledge": k.is_collective, "date": k.date, "permissions": k.permissions,
        "description": k.description, "fullContent": k.full_content, "mediaUrl": k.media_url,
        "audioUrl": k.audio_url, "videoUrl": k.video_url, "tags": k.tags, "status": k.status,
        "approvals": [_sin_nulos({
            "communityId": a.community_id, "communityName": a.community_name, "custodianId": a.custodian_codigo,
            "custodianName": a.custodian_name, "status": a.status, "note": a.note, "decisionDate": a.decision_date,
        }) for a in k.approvals],
        "authorizedUserIds": k.authorized_user_ids, "accessGrants": [_grant_dict(g) for g in k.grants],
        "excerptForPublic": k.excerpt_for_public, "audioDuration": k.audio_duration,
        "educationalData": k.educational_data, "isDemo": k.is_demo,
    })


def _educacion_protegida(s: Dict) -> Dict:
    """Lo que ve quien NO tiene permiso de lectura: título y descripción, nunca el contenido."""
    return {
        "simpleExplanation": "", "summary": s.get("excerptForPublic") or "",
        "sampleQuestions": [], "outOfDomainQuestion": {"q": "", "ans": "", "explanation": ""},
        "slides": [{"number": 1, "title": s["title"], "content": "Contenido protegido por la custodia comunitaria.",
                    "teachingNote": "", "sourceAnchor": ""}],
        "learningGuide": {"keyConcepts": [], "reflectionQuestions": [], "classroomActivity": ""},
        "podcastTranscript": [], "conceptNodes": [], "videoStoryboard": [],
    }


def saber_para(user: Dict | None, s: Dict) -> Dict:
    """Versión del saber que puede salir hacia una persona concreta (evita fugas e IDOR)."""
    out = dict(s)
    custodio = bool(user) and az.puede_revisar_recurso(user, s)
    if not custodio:
        uid = user["id"] if user else None
        out["accessGrants"] = [g for g in s.get("accessGrants", []) if g["userId"] == uid]
        out["authorizedUserIds"] = [x for x in s.get("authorizedUserIds", []) if x == uid]
    if not az.puede_leer(user, s)["allowed"]:
        out["fullContent"] = ""
        out["educationalData"] = _educacion_protegida(s)
        out.pop("audioUrl", None)
        out.pop("videoUrl", None)
    return out


def solicitud_dict(r: AccessRequest) -> Dict:
    return _sin_nulos({
        "id": r.id, "userId": r.requester.codigo, "userName": r.requester.nombre, "userRole": r.requester.role_label,
        "userEmail": r.requester.email or "", "userOrganization": r.requester.organization,
        "knowledgeId": r.knowledge_id, "knowledgeTitle": r.knowledge.title, "communityId": r.community_id,
        "communityName": r.community.name, "requestDate": r.request_date, "purpose": r.purpose,
        "requestedPermissions": r.requested_permissions, "status": r.status, "responseDate": r.response_date,
        "responseNote": r.response_note, "custodianId": r.custodian.codigo if r.custodian else None,
        "custodianName": r.custodian.nombre if r.custodian else None,
    })


def vinculacion_dict(a: AffiliationRequest) -> Dict:
    return _sin_nulos({
        "id": a.id, "userId": a.user.codigo, "userName": a.user.nombre, "communityId": a.community_id,
        "communityName": a.community.name, "requestDate": a.request_date, "rationale": a.rationale,
        "status": a.status, "responseNote": a.response_note,
    })


def derivado_dict(g: AiGeneration) -> Dict:
    return _sin_nulos({
        "id": g.id, "knowledgeId": g.knowledge_id, "knowledgeTitle": g.knowledge.title,
        "communityIds": g.community_ids, "communityName": g.community_name, "type": g.type, "title": g.title,
        "summary": g.summary, "generatedAt": g.generated_at, "authorUserId": g.user.codigo,
        "authorName": g.user.nombre, "status": g.status, "public": g.public,
        "custodianFeedback": g.custodian_feedback, **(g.payload or {}),
    })


def canal_dict(c: CanalBienestar) -> Dict:
    return {"id": c.id, "category": c.category, "title": c.title, "description": c.description,
            "communityTarget": c.community_target, "channelInfo": c.channel_info, "status": c.status}


# ---------------------------------------------------------------------------
# Lecturas
# ---------------------------------------------------------------------------
def _todos_los_saberes(db: Session) -> list[Dict]:
    return [saber_dict(k) for k in db.scalars(select(Knowledge).order_by(Knowledge.created_at.desc(), Knowledge.id))]


def _saber_o_404(db: Session, knowledge_id: str) -> Knowledge:
    k = db.get(Knowledge, knowledge_id)
    if not k:
        raise ErrorNegocio("El saber solicitado no existe.", 404)
    return k


def listar_saberes(db: Session, usuario: Usuario | None) -> list[Dict]:
    u = usuario_dict(usuario) if usuario else None
    return [saber_para(u, s) for s in _todos_los_saberes(db) if az.visible_en_catalogo(u, s)]


def obtener_saber(db: Session, usuario: Usuario | None, knowledge_id: str) -> Dict:
    u = usuario_dict(usuario) if usuario else None
    s = saber_dict(_saber_o_404(db, knowledge_id))
    if not az.visible_en_catalogo(u, s):
        raise ErrorNegocio("El saber solicitado no existe.", 404)
    return {**saber_para(u, s), "access": az.puede_leer(u, s)}


def listar_comunidades(db: Session) -> list[Dict]:
    return [comunidad_dict(c) for c in db.scalars(select(Community).order_by(Community.name))]


def listar_solicitudes(db: Session, usuario: Usuario) -> list[Dict]:
    u = usuario_dict(usuario)
    filas = db.scalars(select(AccessRequest).order_by(AccessRequest.created_at.desc()))
    return [solicitud_dict(r) for r in filas if r.requester_id == usuario.id or az.es_custodio_de(u, r.community_id)]


def listar_vinculaciones(db: Session, usuario: Usuario) -> list[Dict]:
    u = usuario_dict(usuario)
    filas = db.scalars(select(AffiliationRequest).order_by(AffiliationRequest.created_at.desc()))
    return [vinculacion_dict(a) for a in filas if a.user_id == usuario.id or az.es_custodio_de(u, a.community_id)]


def listar_derivados(db: Session, usuario: Usuario | None) -> list[Dict]:
    u = usuario_dict(usuario) if usuario else None
    saberes = {s["id"]: s for s in _todos_los_saberes(db)}
    salida = []
    for g in db.scalars(select(AiGeneration).order_by(AiGeneration.created_at.desc())):
        d = derivado_dict(g)
        propio = usuario is not None and g.user_id == usuario.id
        revisor = u is not None and az.puede_revisar_recurso(u, d)
        publicado = g.status == "approved_by_custodian" and g.public and g.knowledge_id in saberes \
            and az.puede_leer(u, saberes[g.knowledge_id])["allowed"]
        if propio or revisor or publicado:
            salida.append(d)
    return salida


def cola_de_custodia(db: Session, usuario: Usuario) -> Dict:
    """Bandeja del custodio: solo trámites de las comunidades que custodia."""
    u = usuario_dict(usuario)
    if not az.comunidades_custodiadas(u):
        raise ErrorNegocio("Tu perfil no tiene autoridad de custodia verificada en ninguna comunidad.", 403)
    return {
        "accessRequests": [r for r in listar_solicitudes(db, usuario) if r["status"] == "pending" and az.puede_revisar_recurso(u, r)],
        "affiliationRequests": [a for a in listar_vinculaciones(db, usuario) if a["status"] == "pending" and az.puede_revisar_recurso(u, a)],
        "knowledges": [s for s in listar_saberes(db, usuario) if s["status"] == "pending_review" and az.puede_revisar_recurso(u, s)],
        "aiOutputs": [d for d in listar_derivados(db, usuario) if d["status"] == "draft_pending_review" and az.puede_revisar_recurso(u, d)],
    }


def usuarios_demo(db: Session) -> list[Dict]:
    return [usuario_dict(u) for u in db.scalars(select(Usuario).where(Usuario.is_demo.is_(True)).order_by(Usuario.id))]


def bootstrap(db: Session, usuario: Usuario | None, incluir_demo: bool) -> Dict:
    """Todo lo que la app necesita al abrir, ya filtrado por los permisos de la persona."""
    return {
        "me": usuario_dict(usuario) if usuario else None,
        "users": usuarios_demo(db) if incluir_demo else ([usuario_dict(usuario)] if usuario else []),
        "communities": listar_comunidades(db),
        "knowledgeItems": listar_saberes(db, usuario),
        "accessRequests": listar_solicitudes(db, usuario) if usuario else [],
        "affiliationRequests": listar_vinculaciones(db, usuario) if usuario else [],
        "aiArtifacts": listar_derivados(db, usuario),
        "wellnessItems": [canal_dict(c) for c in db.scalars(select(CanalBienestar).order_by(CanalBienestar.id))],
        "serverTime": _ahora().isoformat(),
    }


# ---------------------------------------------------------------------------
# Solicitudes de acceso
# ---------------------------------------------------------------------------
def solicitar_acceso(db: Session, usuario: Usuario, knowledge_id: str, proposito: str,
                     permisos: dict[str, bool] | None, client_id: str | None) -> Dict:
    rid = nuevo_id("req", client_id)
    if existente := db.get(AccessRequest, rid):
        return solicitud_dict(existente)
    k = _saber_o_404(db, knowledge_id)
    u = usuario_dict(usuario)
    s = saber_dict(k)
    lectura = az.puede_leer(u, s)
    if lectura["allowed"]:
        raise ErrorNegocio("Ya tienes acceso a este saber.", 409)
    if not lectura["canRequest"]:
        raise ErrorNegocio(lectura["reason"], 403)
    pendiente = db.scalar(select(AccessRequest).where(
        AccessRequest.knowledge_id == k.id, AccessRequest.requester_id == usuario.id, AccessRequest.status == "pending"))
    if pendiente:
        raise ErrorNegocio("Ya tienes una solicitud en trámite para este material.", 409)
    r = AccessRequest(
        id=rid, knowledge_id=k.id, requester_id=usuario.id, community_id=s["communityIds"][0],
        purpose=proposito.strip() or "Consulta académica para diálogo intercultural de saberes.",
        requested_permissions=permisos or {"consultation": True, "aiProcessing": True, "derivatives": True},
        status="pending", request_date=fecha_corta(),
    )
    db.add(r)
    auditar(db, usuario, "access_request.created", "knowledge", k.id, r.community_id)
    db.flush()
    db.refresh(r)
    return solicitud_dict(r)


def decidir_acceso(db: Session, usuario: Usuario, request_id: str, aprobar: bool, nota: str | None) -> Dict:
    r = db.get(AccessRequest, request_id)
    if not r:
        raise ErrorNegocio("La solicitud no existe.", 404)
    if not az.es_custodio_de(usuario_dict(usuario), r.community_id):
        raise ErrorNegocio(f"No tienes autoridad de custodio sobre {r.community.name}. Cada comunidad tiene su propia custodia.", 403)
    if r.status != "pending":
        return solicitud_dict(r)
    r.status = "approved" if aprobar else "rejected"
    r.response_date = fecha_corta()
    r.custodian_user_id = usuario.id
    r.response_note = nota or ("Autorizado con fines académicos respetuosos." if aprobar
                               else "En este momento la comunidad no considera oportuna la apertura de este saber.")
    if aprobar:
        previo = db.scalar(select(AccessGrant).where(AccessGrant.knowledge_id == r.knowledge_id,
                                                     AccessGrant.user_id == r.requester_id))
        if previo:
            previo.revoked_at = None
            previo.request_id = r.id
            previo.granted_by = usuario.id
            previo.granted_at = _ahora()
        else:
            db.add(AccessGrant(id=nuevo_id("grant"), knowledge_id=r.knowledge_id, user_id=r.requester_id,
                               request_id=r.id, granted_by=usuario.id))
        k = db.get(Knowledge, r.knowledge_id)
        if k and r.requester.codigo not in k.authorized_user_ids:
            k.authorized_user_ids = [*k.authorized_user_ids, r.requester.codigo]
    auditar(db, usuario, f"access_request.{r.status}", "access_request", r.id, r.community_id)
    db.flush()
    return solicitud_dict(r)


# ---------------------------------------------------------------------------
# Vinculación a comunidades
# ---------------------------------------------------------------------------
def solicitar_vinculacion(db: Session, usuario: Usuario, community_id: str, razon: str, client_id: str | None) -> Dict:
    aid = nuevo_id("aff", client_id)
    if existente := db.get(AffiliationRequest, aid):
        return vinculacion_dict(existente)
    c = db.get(Community, community_id)
    if not c:
        raise ErrorNegocio("La comunidad no existe.", 404)
    m = db.scalar(select(Membership).where(Membership.user_id == usuario.id, Membership.community_id == c.id))
    if m and m.status == "verified":
        raise ErrorNegocio(f"Ya eres integrante verificado de {c.name}.", 409)
    a = AffiliationRequest(id=aid, user_id=usuario.id, community_id=c.id, status="pending", request_date=fecha_corta(),
                           rationale=razon.strip() or "Deseo participar en los espacios de diálogo y preservación.")
    db.add(a)
    if m:
        m.status, m.role = "pending", "member"
    else:
        db.add(Membership(user_id=usuario.id, community_id=c.id, role="member", status="pending"))
    auditar(db, usuario, "affiliation.requested", "community", c.id, c.id)
    db.flush()
    db.refresh(a)
    return vinculacion_dict(a)


def decidir_vinculacion(db: Session, usuario: Usuario, aff_id: str, aprobar: bool, nota: str | None) -> Dict:
    a = db.get(AffiliationRequest, aff_id)
    if not a:
        raise ErrorNegocio("La solicitud de vinculación no existe.", 404)
    if not az.es_custodio_de(usuario_dict(usuario), a.community_id):
        raise ErrorNegocio(f"No eres custodio de {a.community.name}. Solo sus autoridades pueden validar integrantes.", 403)
    if a.status != "pending":
        return vinculacion_dict(a)
    a.status = "approved" if aprobar else "rejected"
    a.response_note = nota
    m = db.scalar(select(Membership).where(Membership.user_id == a.user_id, Membership.community_id == a.community_id))
    if aprobar:
        if m:
            m.status, m.verified_at, m.joined_date = "verified", _ahora(), fecha_simple()
        else:
            db.add(Membership(user_id=a.user_id, community_id=a.community_id, role="member", status="verified",
                              verified_at=_ahora(), joined_date=fecha_simple()))
    elif m and m.status == "pending":
        db.delete(m)
    auditar(db, usuario, f"affiliation.{a.status}", "affiliation_request", a.id, a.community_id)
    db.flush()
    return vinculacion_dict(a)


# ---------------------------------------------------------------------------
# Aportes de saberes y aprobación por consenso
# ---------------------------------------------------------------------------
def _datos_educativos_base(titulo: str, descripcion: str, autor: str) -> Dict:
    return {
        "summary": descripcion, "simpleExplanation": descripcion,
        "sampleQuestions": [{"q": f"¿Cuál es el valor principal de {titulo}?",
                             "ans": f"Según el aporte registrado por {autor}: {descripcion}",
                             "quote": descripcion, "anchor": "Descripción del saber"}],
        "outOfDomainQuestion": {"q": "¿Qué información externa existe sobre este saber?",
                                "ans": "Información no disponible en la fuente: Ceiba ancla sus respuestas exclusivamente en el testimonio aportado.",
                                "explanation": "Principio de no invención algorítmica."},
        "slides": [{"number": 1, "title": titulo, "content": descripcion,
                    "teachingNote": "Analizar el origen y pertinencia comunitaria del material.",
                    "sourceAnchor": f"Aporte de {autor}"}],
        "learningGuide": {"keyConcepts": [{"term": "Saber Territorial", "definition": "Conocimiento situado aportado al archivo de ALUNA."}],
                          "reflectionQuestions": ["¿Cómo dialoga este saber con la sostenibilidad del territorio?"],
                          "classroomActivity": "Debate en aula sobre la protección de saberes comunitarios."},
        "podcastTranscript": [{"speaker": autor, "role": "Aportante", "time": "00:00 - 00:30", "text": descripcion}],
        "conceptNodes": [{"id": "aporte", "label": titulo, "category": "practica", "description": descripcion, "connections": []}],
        "videoStoryboard": [{"scene": 1, "visual": "Registro fotográfico del territorio.", "narration": descripcion,
                             "note": "Borrador preliminar."}],
    }


def proponer_saber(db: Session, usuario: Usuario, datos: Dict) -> Dict:
    kid = nuevo_id("know", datos.get("id"))
    if db.get(Knowledge, kid):
        return obtener_saber(db, usuario, kid)
    ids = list(dict.fromkeys(datos["communityIds"]))
    comunidades = [db.get(Community, c) for c in ids]
    if not ids or any(c is None for c in comunidades):
        raise ErrorNegocio("Elige al menos una comunidad titular válida.", 422)
    u = usuario_dict(usuario)
    for c in comunidades:
        if not c.policies.get("acceptsExternalContributions", True) and not az.es_miembro_verificado(u, c.id):
            raise ErrorNegocio(f"{c.name} no recibe aportes de personas externas en este momento.", 403)

    k = Knowledge(
        id=kid, title=datos["title"].strip(), type=datos["type"], author=usuario.nombre, author_role=usuario.role_label,
        created_by=usuario.id, author_codigo=usuario.codigo, is_collective=bool(datos.get("isCollective")), date=fecha_corta(),
        description=datos["description"].strip(), excerpt_for_public=datos["description"].strip()[:150] + "...",
        full_content=datos.get("fullContent") or "", media_url=datos.get("mediaUrl") or "/assets/photos/campus_lago_aerea_limpia.jpg",
        tags=datos.get("tags") or ["Saber Territorial", "Diálogo ALUNA"], permissions=datos["permissions"],
        educational_data=_datos_educativos_base(datos["title"].strip(), datos["description"].strip(), usuario.nombre),
        authorized_user_ids=[usuario.codigo], status="pending_review",
    )
    k.educational_data["provenance"] = datos.get("provenance") or ""
    db.add(k)
    for pos, c in enumerate(comunidades):
        db.add(KnowledgeOwner(knowledge_id=kid, community_id=c.id, position=pos))
        propio = az.es_custodio_de(u, c.id)
        custodio = (c.custodians or [{}])[0]
        db.add(Approval(
            knowledge_id=kid, community_id=c.id, community_name=c.name,
            custodian_user_id=usuario.id if propio else None,
            custodian_codigo=usuario.codigo if propio else custodio.get("id"),
            custodian_name=usuario.nombre if propio else custodio.get("name"),
            status="approved" if propio else "pending",
            decision_date=fecha_simple() if propio else None,
            note="Aprobado directamente por autor con facultades de custodia." if propio else "Pendiente de revisión.",
        ))
    db.flush()
    db.refresh(k)
    if az.aprobacion_unanime(saber_dict(k)):
        k.status = "approved"
    auditar(db, usuario, "knowledge.proposed", "knowledge", kid, ids[0], comunidades=ids)
    db.flush()
    return obtener_saber(db, usuario, kid)


def decidir_saber(db: Session, usuario: Usuario, knowledge_id: str, community_id: str, aprobar: bool, nota: str | None) -> Dict:
    k = _saber_o_404(db, knowledge_id)
    if not az.es_custodio_de(usuario_dict(usuario), community_id):
        raise ErrorNegocio("No tienes autoridad de custodio para decidir sobre contenidos de esta comunidad.", 403)
    a = next((x for x in k.approvals if x.community_id == community_id), None)
    if not a:
        raise ErrorNegocio("Esa comunidad no es titular de este saber.", 403)
    a.status = "approved" if aprobar else "rejected"
    a.custodian_user_id, a.custodian_codigo, a.custodian_name = usuario.id, usuario.codigo, usuario.nombre
    a.decision_date = fecha_simple()
    a.note = nota or ("Aprobado según las normas de gobernanza comunitaria." if aprobar
                      else "Aporte no admitido para salvaguarda comunitaria.")
    db.flush()
    db.refresh(k)
    if not aprobar:
        k.status = "rejected"
    else:
        k.status = "approved" if az.aprobacion_unanime(saber_dict(k)) else "pending_review"
    auditar(db, usuario, f"knowledge.{a.status}", "knowledge", k.id, community_id)
    db.flush()
    return {"knowledgeId": k.id, "status": k.status, "multiCommunity": len(k.owners) > 1}


def cambiar_permiso_ia(db: Session, usuario: Usuario, knowledge_id: str, habilitar: bool) -> Dict:
    k = _saber_o_404(db, knowledge_id)
    if not az.puede_revisar_recurso(usuario_dict(usuario), saber_dict(k)):
        raise ErrorNegocio(f"Solo el custodio de la comunidad titular puede {'habilitar' if habilitar else 'revocar'} permisos de IA.", 403)
    perms = dict(k.permissions)
    if habilitar:
        perms.update({"aiQueryAllowed": "derived_approval_required", "derivativeGenerationAllowed": True})
        perms.pop("revokedAt", None)
    else:
        perms["revokedAt"] = _ahora().isoformat()
    k.permissions = perms
    auditar(db, usuario, "ai_permission.granted" if habilitar else "ai_permission.revoked", "knowledge", k.id,
            k.owners[0].community_id if k.owners else None)
    db.flush()
    return {"knowledgeId": k.id, "permissions": perms}


# ---------------------------------------------------------------------------
# Ceiba y derivados con IA
# ---------------------------------------------------------------------------
def consultar_ceiba(db: Session, usuario: Usuario, knowledge_ids: list[str], pregunta: str) -> Dict:
    u = usuario_dict(usuario)
    respuesta = ceiba.consultar(u, _todos_los_saberes(db), knowledge_ids, pregunta)
    auditar(db, usuario, "ai.query", "knowledge", (knowledge_ids or [None])[0],
            supported=respuesta["supported"], refusal=respuesta.get("refusalReason"))
    return respuesta


def _guardar_derivado(db: Session, usuario: Usuario, datos: Dict, client_id: str | None) -> Dict:
    gid = nuevo_id("art", client_id)
    if existente := db.get(AiGeneration, gid):
        return derivado_dict(existente)
    k = _saber_o_404(db, datos["knowledgeId"])
    s = saber_dict(k)
    chequeo = az.puede_consultar_con_ia(usuario_dict(usuario), s)
    if not chequeo["allowed"]:
        raise ErrorNegocio(chequeo["reason"], 403)
    g = AiGeneration(
        id=gid, user_id=usuario.id, knowledge_id=k.id,
        community_ids=s["communityIds"],  # siempre las comunidades titulares reales, no las que diga el cliente
        community_name=" y ".join(s["communityNames"]), type=datos.get("type", "transform"),
        title=datos.get("title") or f"Derivado de {k.title}", summary=datos.get("summary") or "",
        generated_at=fecha_hora(), status="draft_pending_review", public=False,
        custodian_feedback=datos.get("custodianFeedback"),
        payload={c: datos[c] for c in CAMPOS_PAYLOAD if datos.get(c) is not None},
    )
    db.add(g)
    auditar(db, usuario, "ai.output_created", "ai_generation", gid, s["communityIds"][0] if s["communityIds"] else None)
    db.flush()
    db.refresh(g)
    return derivado_dict(g)


def transformar_con_ceiba(db: Session, usuario: Usuario, knowledge_id: str, pedido: Dict, client_id: str | None) -> Dict:
    s = saber_dict(_saber_o_404(db, knowledge_id))
    resultado = ceiba.transformar(usuario_dict(usuario), s, pedido)
    if not resultado["allowed"]:
        raise ErrorNegocio(resultado["errorReason"], 403)
    return _guardar_derivado(db, usuario, resultado["artifact"], client_id)


def guardar_derivado(db: Session, usuario: Usuario, datos: Dict) -> Dict:
    return _guardar_derivado(db, usuario, datos, datos.get("id"))


def decidir_derivado(db: Session, usuario: Usuario, output_id: str, aprobar: bool, nota: str | None) -> Dict:
    g = db.get(AiGeneration, output_id)
    if not g:
        raise ErrorNegocio("El borrador no existe.", 404)
    if not az.puede_revisar_recurso(usuario_dict(usuario), {"communityIds": g.community_ids}):
        raise ErrorNegocio("Acceso denegado: no tienes autoridad de custodia sobre la comunidad titular de este borrador.", 403)
    g.status = "approved_by_custodian" if aprobar else "rejected"
    g.public = aprobar
    g.custodian_feedback = nota or (f"Aprobado por {usuario.nombre} conforme a las directrices comunitarias." if aprobar
                                    else "Rechazado por la custodia para proteger la fidelidad a la fuente comunitaria.")
    auditar(db, usuario, f"ai.output_{'approved' if aprobar else 'rejected'}", "ai_generation", g.id,
            g.community_ids[0] if g.community_ids else None)
    db.flush()
    return derivado_dict(g)


# ---------------------------------------------------------------------------
# Bienestar (aislado de Ceiba y del repositorio cultural)
# ---------------------------------------------------------------------------
def registrar_orientacion(db: Session, usuario: Usuario, descripcion: str, canal_id: str | None) -> Dict:
    if canal_id and not db.get(CanalBienestar, canal_id):
        canal_id = None
    s = SolicitudOrientacion(usuario_id=usuario.id, canal_id=canal_id, descripcion=descripcion.strip())
    db.add(s)
    db.flush()
    return {"id": s.id, "estado": s.estado}
