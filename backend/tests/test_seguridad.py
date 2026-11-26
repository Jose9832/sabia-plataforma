"""Pruebas de los controles de seguridad (no necesitan base de datos)."""
from types import SimpleNamespace

import bcrypt
import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.core import limites
from app.core.config import Settings, settings
from app.core.security import hash_clave, verificar_clave
from app.main import app
from app.services import demo_service
from app.services.comun import ErrorNegocio


def test_hash_anterior_de_passlib_sigue_siendo_valido():
    # passlib guardaba hashes bcrypt estándar ($2b$): deben seguir funcionando sin migrar cuentas.
    anterior = bcrypt.hashpw(b"aluna2026", bcrypt.gensalt(rounds=4)).decode()
    assert verificar_clave("aluna2026", anterior)
    assert not verificar_clave("otra", anterior)
    assert not verificar_clave("x", None) and not verificar_clave("x", "no-es-un-hash")


def test_claves_largas_no_rompen_bcrypt():
    larga = "ñ" * 100  # 200 bytes: bcrypt solo usa 72
    assert verificar_clave(larga, hash_clave(larga))


def test_produccion_exige_clave_secreta_fuerte():
    with pytest.raises(ValueError, match="SECRET_KEY"):
        Settings(ENVIRONMENT="production", SECRET_KEY="cambia-esta-clave-en-produccion")
    with pytest.raises(ValueError, match="SECRET_KEY"):
        Settings(ENVIRONMENT="production", SECRET_KEY="corta")
    ok = Settings(ENVIRONMENT="production", SECRET_KEY="x" * 40)
    assert ok.es_produccion and not ok.docs_habilitada
    assert Settings(ENVIRONMENT="development").docs_habilitada


def test_limite_de_intentos_por_ip():
    limites.reiniciar_limites()
    prueba = FastAPI()

    @prueba.exception_handler(ErrorNegocio)
    async def _error(_, exc: ErrorNegocio):
        from fastapi.responses import JSONResponse

        return JSONResponse(status_code=exc.status_code, content={"detail": exc.mensaje})

    @prueba.post("/login", dependencies=[Depends(limites.limitar_autenticacion)])
    def _login():
        return {"ok": True}

    cliente = TestClient(prueba)
    codigos = [cliente.post("/login").status_code for _ in range(settings.RATE_LIMIT_AUTH + 2)]
    assert codigos[: settings.RATE_LIMIT_AUTH] == [200] * settings.RATE_LIMIT_AUTH
    assert codigos[-1] == 429
    limites.reiniciar_limites()


def test_reinicio_demo_solo_para_administrador_tecnico(monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_DEMO_PROFILES", True)
    with pytest.raises(ErrorNegocio) as e:
        demo_service.reiniciar_demostracion(None, SimpleNamespace(is_technical_admin=False))
    assert e.value.status_code == 403
    monkeypatch.setattr(settings, "ENABLE_DEMO_PROFILES", False)
    with pytest.raises(ErrorNegocio):
        demo_service.reiniciar_demostracion(None, SimpleNamespace(is_technical_admin=True))


def test_cabeceras_de_seguridad_en_la_api():
    r = TestClient(app).get("/api/openapi.json")
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert "Content-Security-Policy" not in r.headers  # la CSP es solo para páginas HTML


def test_registro_exige_autorizar_el_tratamiento_de_datos():
    from app.services import auth_service

    base = {"name": "Laura Gómez", "email": "laura@ejemplo.com", "password": "clave-segura-1", "identity": "visitor"}
    # La validación ocurre antes de tocar la base de datos: sin autorización no se crea la cuenta.
    for extra in ({}, {"acceptDataPolicy": False}, {"acceptDataPolicy": "true"}, {"acceptDataPolicy": None}):
        with pytest.raises(ErrorNegocio) as e:
            auth_service.registrar(None, {**base, **extra})  # type: ignore[arg-type]
        assert e.value.status_code == 422 and "autorizar" in e.value.mensaje


def test_planta_nueva_no_recibe_comunidad_del_cliente():
    from app.schemas.contenido import PlantaCrear

    # La comunidad no es un campo del aporte: la fija el servidor según la membresía verificada.
    assert "comunidad" not in PlantaCrear.model_fields
    p = PlantaCrear(nombre="Paico", uso="Dolor de estómago", preparacion="Infusión de hojas", comunidad="afro")  # type: ignore[call-arg]
    assert p.compartir is False and not hasattr(p, "comunidad")
    with pytest.raises(Exception):
        PlantaCrear(nombre="P", uso="x", preparacion="y")


def test_sync_acepta_el_tipo_planta():
    from app.services.sync_service import OPERACIONES

    assert "planta" in OPERACIONES
