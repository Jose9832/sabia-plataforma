"""Carga los datos de ejemplo del prototipo (datos/semilla.json) en PostgreSQL.

Es idempotente: solo llena las tablas que estén vacías, así que se puede
ejecutar en cada arranque del contenedor (`python -m app.seed`).
"""
import json
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_clave
from app.models import (
    AlertaVeredal,
    Comunidad,
    Encuentro,
    HistoriaProducto,
    Investigacion,
    Lugar,
    Planta,
    Relato,
    SemillaTrueque,
    Usuario,
    Visibilidad,
)

log = logging.getLogger("sabia.seed")


def _vacia(db: Session, modelo) -> bool:
    return db.scalar(select(func.count()).select_from(modelo)) == 0


def _ajustar_secuencia(db: Session, tabla: str) -> None:
    """Tras insertar ids explícitos, la secuencia de PostgreSQL debe continuar desde el máximo."""
    db.execute(text(
        f"SELECT setval(pg_get_serial_sequence('{tabla}', 'id'), COALESCE((SELECT MAX(id) FROM {tabla}), 1))"
    ))


def cargar(db: Session, datos: dict) -> dict[str, int]:
    resumen: dict[str, int] = {}

    if _vacia(db, Usuario):
        for u in datos["usuarios"]:
            db.add(Usuario(numero_identificacion=u["numero_identificacion"], nombre=u["nombre"],
                           comunidad=Comunidad(u["comunidad"]), clave_hash=hash_clave(u["clave"])))
        resumen["usuarios"] = len(datos["usuarios"])

    if _vacia(db, Relato):
        for r in datos["relatos"]:
            db.add(Relato(**{**r, "comunidad": Comunidad(r["comunidad"]), "visibilidad": Visibilidad(r["visibilidad"])}))
        db.flush()
        _ajustar_secuencia(db, "relatos")
        resumen["relatos"] = len(datos["relatos"])

    if _vacia(db, Lugar):
        for lugar in datos["lugares"]:
            db.add(Lugar(**lugar))
        db.flush()
        _ajustar_secuencia(db, "lugares")
        resumen["lugares"] = len(datos["lugares"])

    if _vacia(db, Planta):
        for p in datos["plantas"]:
            db.add(Planta(**{**p, "comunidad": Comunidad(p["comunidad"])}))
        resumen["plantas"] = len(datos["plantas"])

    if _vacia(db, HistoriaProducto):
        for h in datos["historias"]:
            db.add(HistoriaProducto(**{**h, "comunidad": Comunidad(h["comunidad"]), "visibilidad": Visibilidad.afuera}))
        db.flush()
        _ajustar_secuencia(db, "historias_producto")
        resumen["historias"] = len(datos["historias"])

    if _vacia(db, Encuentro):
        for e in datos["encuentros"]:
            db.add(Encuentro(**{**e, "comunidad": Comunidad(e["comunidad"]), "visibilidad": Visibilidad(e["visibilidad"])}))
        db.flush()
        _ajustar_secuencia(db, "encuentros")
        resumen["encuentros"] = len(datos["encuentros"])

    if _vacia(db, Investigacion):
        for i in datos["investigaciones"]:
            db.add(Investigacion(**i))
        db.flush()
        _ajustar_secuencia(db, "investigaciones")
        resumen["investigaciones"] = len(datos["investigaciones"])

    if _vacia(db, SemillaTrueque):
        for s in datos["semillas"]:
            db.add(SemillaTrueque(**s, es_ejemplo=True))
        db.flush()
        _ajustar_secuencia(db, "semillas_trueque")
        resumen["semillas"] = len(datos["semillas"])

    if _vacia(db, AlertaVeredal):
        ahora = datetime.now(timezone.utc)
        antiguedad = [timedelta(hours=2), timedelta(days=1), timedelta(days=3)]
        for a, hace in zip(datos["alertas"], antiguedad, strict=False):
            db.add(AlertaVeredal(**a, sincronizado_en=ahora - hace))
        db.flush()
        _ajustar_secuencia(db, "alertas_veredales")
        resumen["alertas"] = len(datos["alertas"])

    db.commit()
    return resumen


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    ruta = settings.seed_path
    if not ruta.exists():
        log.warning("No se encontró %s: se omite la carga de datos de ejemplo.", ruta)
        return
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    with SessionLocal() as db:
        resumen = cargar(db, datos)
    if resumen:
        log.info("Datos de ejemplo cargados: %s", ", ".join(f"{k}={v}" for k, v in resumen.items()))
    else:
        log.info("La base de datos ya tenía datos: no se cargó nada nuevo.")


if __name__ == "__main__":
    main()
