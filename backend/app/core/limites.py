"""Límite de intentos por IP para el inicio de sesión y el registro (contra fuerza bruta).

Ventana deslizante en memoria: basta para un solo proceso (Render, Docker Compose).
Con varias réplicas habría que moverlo a Redis o a la base de datos.
"""
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Request

from app.core.config import settings
from app.services.comun import ErrorNegocio

_intentos: dict[str, deque[float]] = defaultdict(deque)
_candado = Lock()


def _ip(request: Request) -> str:
    # uvicorn corre con --proxy-headers: request.client ya es la IP real detrás del proxy de Render.
    return request.client.host if request.client else "desconocida"


def limitar_autenticacion(request: Request) -> None:
    """Dependencia de FastAPI: corta con 429 si la IP supera el límite en la ventana."""
    limite, ventana = settings.RATE_LIMIT_AUTH, settings.RATE_LIMIT_WINDOW_SECONDS
    if limite <= 0:
        return
    clave = f"{_ip(request)}:{request.url.path}"
    ahora = time.monotonic()
    with _candado:
        cola = _intentos[clave]
        while cola and ahora - cola[0] > ventana:
            cola.popleft()
        if len(cola) >= limite:
            espera = int(ventana - (ahora - cola[0])) + 1
            minutos = max(1, round(espera / 60))
            raise ErrorNegocio(f"Demasiados intentos. Espera unos {minutos} min y vuelve a intentarlo.", 429)
        cola.append(ahora)
        if len(_intentos) > 10_000:  # evita crecer sin control
            for k in [k for k, v in _intentos.items() if not v or ahora - v[-1] > ventana]:
                del _intentos[k]


def reiniciar_limites() -> None:
    """Para las pruebas."""
    with _candado:
        _intentos.clear()
