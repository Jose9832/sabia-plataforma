"""Autorización centralizada de ALUNA (SABIA & CEIBA) del lado del servidor.

Es el espejo exacto de `frontend/src/domain/authorization.ts`: la interfaz usa la
versión TypeScript para mostrar candados y botones, pero quien decide de verdad es
este módulo (cada endpoint lo consulta antes de devolver o modificar datos).

Trabaja sobre los mismos diccionarios camelCase que entrega la API (User, KnowledgeItem…).
"""
from datetime import datetime, timezone
from typing import Any

Dict = dict[str, Any]

REFUSAL_NO_READ = "NO_READ_PERMISSION"
REFUSAL_AI_NOT_ALLOWED = "AI_NOT_ALLOWED"
REFUSAL_AI_REVOKED = "AI_PERMISSION_REVOKED"


def _ahora_ms() -> float:
    return datetime.now(timezone.utc).timestamp() * 1000


def _ms(fecha: str | None) -> float | None:
    if not fecha:
        return None
    try:
        return datetime.fromisoformat(fecha.replace("Z", "+00:00")).timestamp() * 1000
    except ValueError:
        return None


def es_miembro_verificado(user: Dict, community_id: str) -> bool:
    return any(a["communityId"] == community_id and a["status"] == "verified" and a["role"] != "none"
               for a in user.get("affiliations", []))


def es_custodio_de(user: Dict, community_id: str) -> bool:
    """Nunca existe un custodio «global»: siempre se verifica la comunidad concreta."""
    return any(a["communityId"] == community_id and a["status"] == "verified" and a["role"] == "custodian"
               for a in user.get("affiliations", []))


def comunidades_custodiadas(user: Dict) -> list[str]:
    return [a["communityId"] for a in user.get("affiliations", [])
            if a["status"] == "verified" and a["role"] == "custodian"]


def puede_revisar_recurso(user: Dict, recurso: Dict) -> bool:
    """El custodio solo revisa recursos de las comunidades que custodia (frontera de autoridad)."""
    mias = comunidades_custodiadas(user)
    if not mias:
        return False
    objetivo = recurso.get("communityIds") or ([recurso["communityId"]] if recurso.get("communityId") else [])
    return any(c in mias for c in objetivo)


def aprobacion_unanime(saber: Dict) -> bool:
    """Un saber mancomunado se publica solo cuando TODAS sus comunidades titulares aprobaron."""
    ids, aprobaciones = saber.get("communityIds") or [], saber.get("approvals") or []
    if not ids or not aprobaciones:
        return False
    return all(any(a["communityId"] == c and a["status"] == "approved" for a in aprobaciones) for c in ids)


def tiene_permiso_explicito(user: Dict, saber: Dict) -> bool:
    ahora = _ahora_ms()
    for g in saber.get("accessGrants") or []:
        if g["userId"] != user["id"] or g.get("revokedAt"):
            continue
        vence = _ms(g.get("expiresAt"))
        if vence is not None and vence <= ahora:
            continue
        return True
    return (saber["permissions"].get("consultation") == "restricted"
            and user["id"] in (saber.get("authorizedUserIds") or []))


def puede_leer(user: Dict | None, saber: Dict) -> Dict:
    """Lectura: public · community (miembros verificados) · restricted (permiso explícito) · private (custodia)."""
    if not user:
        aprobado = saber["status"] == "approved" and aprobacion_unanime(saber)
        publico = aprobado and saber["permissions"].get("consultation") == "public"
        return {"allowed": publico, "reason": "Saber aprobado para consulta pública abierta." if publico
                else "Inicia sesión para consultar este saber.", "canRequest": False}

    if saber.get("authorUserId") == user["id"]:
        return {"allowed": True, "reason": "Eres la persona autora o aportante de este saber.", "canRequest": False}

    custodio_titular = puede_revisar_recurso(user, saber)

    if saber["status"] != "approved" or not aprobacion_unanime(saber):
        if custodio_titular:
            return {"allowed": True, "reason": "Acceso de custodia territorial para revisión previa a publicación.",
                    "canRequest": False}
        return {"allowed": False, "reason": "Este saber se encuentra pendiente de aprobación unánime por las custodias titulares.",
                "canRequest": False}

    nivel = saber["permissions"].get("consultation")
    if nivel == "public":
        return {"allowed": True, "reason": "Saber aprobado para consulta pública abierta.", "canRequest": False}

    if nivel == "community":
        if custodio_titular or any(es_miembro_verificado(user, c) for c in saber["communityIds"]):
            return {"allowed": True, "reason": "Acceso concedido como integrante verificado de la comunidad titular.",
                    "canRequest": False}
        if tiene_permiso_explicito(user, saber):
            return {"allowed": True, "reason": "Cuentas con un permiso de acceso explícito vigente otorgado por la custodia.",
                    "canRequest": False}
        return {"allowed": False, "reason": f"Reservado para integrantes verificados de {' / '.join(saber['communityNames'])}.",
                "canRequest": True}

    if nivel == "restricted":
        if custodio_titular or tiene_permiso_explicito(user, saber):
            return {"allowed": True, "reason": "Cuentas con autorización explícita vigente para consultar este saber restringido.",
                    "canRequest": False}
        return {"allowed": False, "reason": "Acceso restringido: requiere solicitud formal aprobada y vigente por la custodia territorial.",
                "canRequest": True}

    if custodio_titular or tiene_permiso_explicito(user, saber):
        return {"allowed": True, "reason": "Acceso autorizado bajo custodia tradicional reservada.", "canRequest": False}
    return {"allowed": False, "reason": "Contenido privado de custodia espiritual/tradicional interna. No admite solicitudes externas.",
            "canRequest": False}


def permiso_operacion_ia(saber: Dict, operacion: str) -> Dict:
    """Permiso granular por operación de IA, con adaptador del campo heredado `aiQueryAllowed`."""
    perms = saber["permissions"]
    explicita = (perms.get("operations") or {}).get(operacion)
    if explicita:
        return {**explicita, "revokedAt": explicita.get("revokedAt") or perms.get("revokedAt"),
                "expiresAt": explicita.get("expiresAt") or perms.get("expiresAt")}
    modo = perms.get("aiQueryAllowed", "none")
    permitido = modo != "none"
    return {
        "operation": operacion,
        "allowed": permitido if operacion in ("query", "transcribe") else permitido and bool(perms.get("derivativeGenerationAllowed")),
        "requiresApproval": operacion in ("publish_derivative", "transform") or modo == "derived_approval_required"
                            or bool(perms.get("derivativePublicationApprovalRequired")),
        "externalProviderAllowed": False,
        "revokedAt": perms.get("revokedAt"),
        "expiresAt": perms.get("expiresAt"),
    }


def puede_consultar_con_ia(user: Dict, saber: Dict) -> Dict:
    """Primero lectura, luego permiso de IA no revocado ni vencido, luego la operación `query`."""
    if not puede_leer(user, saber)["allowed"]:
        return {"allowed": False, "reason": "No tienes permiso de lectura sobre este saber.", "refusalReason": REFUSAL_NO_READ}
    p = permiso_operacion_ia(saber, "query")
    if p.get("revokedAt"):
        return {"allowed": False, "reason": "El permiso de procesamiento con inteligencia artificial fue revocado por la custodia titular.",
                "refusalReason": REFUSAL_AI_REVOKED}
    vence = _ms(p.get("expiresAt"))
    if vence is not None and vence <= _ahora_ms():
        return {"allowed": False, "reason": "El permiso temporal de procesamiento con inteligencia artificial ha expirado.",
                "refusalReason": REFUSAL_AI_REVOKED}
    if not p.get("allowed"):
        return {"allowed": False, "reason": "Este saber puede ser consultado por ti, pero no está autorizado para procesamiento con inteligencia artificial.",
                "refusalReason": REFUSAL_AI_NOT_ALLOWED}
    return {"allowed": True, "reason": "Consulta asistida por Ceiba autorizada sobre esta fuente."}


def puede_transformar_con_ia(user: Dict, saber: Dict) -> Dict:
    consulta = puede_consultar_con_ia(user, saber)
    if not consulta["allowed"]:
        return {"allowed": False, "requiresApproval": True, "reason": consulta["reason"]}
    p = permiso_operacion_ia(saber, "transform")
    if p.get("revokedAt") or not p.get("allowed"):
        return {"allowed": False, "requiresApproval": True,
                "reason": "La comunidad titular no autoriza generar transformaciones o materiales derivados con IA sobre este saber."}
    return {"allowed": True, "requiresApproval": True,
            "reason": "Transformación pedagógica permitida en modo borrador sujeto a revisión del custodio."}


def visible_en_catalogo(user: Dict | None, saber: Dict) -> bool:
    """La biblioteca muestra lo aprobado; los borradores solo los ven su autor y las custodias titulares."""
    if saber["status"] == "approved":
        return True
    if not user:
        return False
    return saber.get("authorUserId") == user["id"] or puede_revisar_recurso(user, saber)
