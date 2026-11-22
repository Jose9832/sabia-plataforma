"""Pruebas unitarias que no necesitan base de datos: `pytest` desde la carpeta backend/."""
import pytest
from pydantic import ValidationError

from app.core.security import crear_token, decodificar_token, hash_clave, verificar_clave
from app.schemas.comunidad import AlertaCrear, GastoCrear
from app.services.contenido_service import analizar_enlace


@pytest.mark.parametrize(
    ("url", "plataforma", "embed"),
    [
        ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
        ("https://youtu.be/dQw4w9WgXcQ?t=3", "youtube", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
        ("https://www.youtube.com/playlist?list=PL123abc", "youtube", "https://www.youtube-nocookie.com/embed/videoseries?list=PL123abc"),
        ("https://open.spotify.com/intl-es/episode/4rOoJ6Egrf8K2IrywzwOMk", "spotify", "https://open.spotify.com/embed/episode/4rOoJ6Egrf8K2IrywzwOMk"),
    ],
)
def test_analizar_enlace_reconoce_plataformas(url, plataforma, embed):
    datos = analizar_enlace(url)
    assert datos and datos["plataforma"] == plataforma and datos["embed"] == embed


def test_analizar_enlace_rechaza_otros_sitios():
    assert analizar_enlace("https://example.com/video") is None


def test_hash_y_token():
    h = hash_clave("sabia123")
    assert h != "sabia123" and verificar_clave("sabia123", h) and not verificar_clave("otra", h)
    assert decodificar_token(crear_token("7"))["sub"] == "7"
    assert decodificar_token("token-falso") is None


def test_alerta_y_gasto():
    with pytest.raises(ValidationError):
        AlertaCrear(tipo="volcan", lugar="x")
    with pytest.raises(ValidationError, match="imagen"):
        AlertaCrear(tipo="plaga", lugar="Lote 3", foto="no-es-una-foto")
    with pytest.raises(ValidationError):
        GastoCrear(client_id="5f0c8a3e-8d1c-4b8e-9f7a-2a1b3c4d5e6f", tipo="Abono", monto=0)
