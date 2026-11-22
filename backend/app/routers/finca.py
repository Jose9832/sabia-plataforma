"""Mi finca: banco de semillas, alertas veredales y cuaderno de cuentas (comunidad campesina)."""
from fastapi import APIRouter, status
from uuid import UUID

from app.core.deps import DbDep, UsuarioDep
from app.schemas.comunidad import (
    AlertaCrear,
    AlertaOut,
    CuadernoActualizar,
    CuentasOut,
    CuentasReiniciar,
    GastoBorrar,
    GastoCrear,
    GastoOut,
    SemillaCrear,
    SemillaOut,
    TruequeCrear,
)
from app.services import finca_service as svc

router = APIRouter(tags=["Salud SABIA · Mi finca"])


@router.get("/semillas", response_model=list[SemillaOut])
def semillas(db: DbDep, usuario: UsuarioDep):
    return svc.listar_semillas(db, usuario)


@router.post("/semillas", response_model=SemillaOut, status_code=status.HTTP_201_CREATED)
def publicar_semilla(datos: SemillaCrear, db: DbDep, usuario: UsuarioDep):
    semilla, _ = svc.crear_semilla(db, usuario, datos)
    db.commit()
    return semilla


@router.post("/semillas/{semilla_id}/trueque", status_code=status.HTTP_201_CREATED)
def proponer_trueque(semilla_id: int, db: DbDep, usuario: UsuarioDep, client_id: UUID | None = None):
    svc.proponer_trueque(db, usuario, TruequeCrear(semilla_id=semilla_id, client_id=client_id))
    db.commit()
    return {"ok": True, "semilla_id": semilla_id}


@router.get("/alertas", response_model=list[AlertaOut])
def alertas(db: DbDep, usuario: UsuarioDep):
    return svc.listar_alertas(db, usuario)


@router.post("/alertas", response_model=AlertaOut, status_code=status.HTTP_201_CREATED)
def dar_alerta(datos: AlertaCrear, db: DbDep, usuario: UsuarioDep):
    alerta, _ = svc.crear_alerta(db, usuario, datos)
    db.commit()
    return alerta


@router.get("/cuentas", response_model=CuentasOut)
def cuentas(db: DbDep, usuario: UsuarioDep):
    out = svc.obtener_cuentas(db, usuario)
    db.commit()
    return out


@router.post("/cuentas/gastos", response_model=GastoOut, status_code=status.HTTP_201_CREATED)
def anotar_gasto(datos: GastoCrear, db: DbDep, usuario: UsuarioDep):
    gasto, _ = svc.anotar_gasto(db, usuario, datos)
    db.commit()
    return gasto


@router.delete("/cuentas/gastos/{gasto_client_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_gasto(gasto_client_id: UUID, db: DbDep, usuario: UsuarioDep):
    svc.borrar_gasto(db, usuario, GastoBorrar(gasto_client_id=gasto_client_id))
    db.commit()


@router.patch("/cuentas", response_model=CuentasOut)
def actualizar_cuaderno(datos: CuadernoActualizar, db: DbDep, usuario: UsuarioDep):
    svc.actualizar_cuaderno(db, usuario, datos)
    db.commit()
    return svc.obtener_cuentas(db, usuario)


@router.post("/cuentas/reiniciar", response_model=CuentasOut)
def reiniciar(datos: CuentasReiniciar, db: DbDep, usuario: UsuarioDep):
    svc.reiniciar_cuentas(db, usuario, datos)
    db.commit()
    return svc.obtener_cuentas(db, usuario)
