"""Contenido de lectura con gobernanza de datos (adentro / afuera)."""
import re
import unicodedata
from typing import Literal
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Comunidad,
    Encuentro,
    HistoriaProducto,
    Investigacion,
    Lugar,
    Planta,
    Podcast,
    Relato,
    Usuario,
    Visibilidad,
)
from app.schemas.contenido import PlantaCrear, PodcastCrear
from app.services.comun import ErrorNegocio, buscar_por_client_id, campos_sync, comunidad_salud

Ventana = Literal["adentro", "afuera"]


def _filtro_ventana(modelo, usuario: Usuario | None, ventana: Ventana):
    """«Mi comunidad» ve lo de su comunidad; «Conocer» solo lo que cada comunidad decidió compartir."""
    if ventana == "adentro":
        if not usuario:
            raise ErrorNegocio("Entra con tu cuenta para ver el contenido de tu comunidad.", 401)
        return modelo.comunidad == comunidad_salud(usuario)
    return modelo.visibilidad == Visibilidad.afuera


def listar_relatos(db: Session, usuario: Usuario | None, ventana: Ventana) -> list[Relato]:
    q = select(Relato).where(_filtro_ventana(Relato, usuario, ventana)).order_by(Relato.id)
    return list(db.scalars(q))


def listar_podcasts(db: Session, usuario: Usuario | None, ventana: Ventana) -> list[Podcast]:
    q = select(Podcast).where(_filtro_ventana(Podcast, usuario, ventana)).order_by(Podcast.creado_en.desc())
    return list(db.scalars(q))


_YT_VIDEO = re.compile(r"(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/)|youtu\.be/)([\w-]{11})")
_YT_LISTA = re.compile(r"youtube\.com/.*[?&]list=([\w-]+)")
_SPOTIFY = re.compile(r"open\.spotify\.com/(?:intl-[\w-]+/)?(episode|show|track|playlist|album)/([A-Za-z0-9]+)")


def analizar_enlace(url: str) -> dict | None:
    """Reconoce enlaces de YouTube y Spotify y arma el reproductor incrustado (igual que el prototipo)."""
    url = url.strip()
    if m := _YT_VIDEO.search(url):
        return {"plataforma": "youtube", "embed": f"https://www.youtube-nocookie.com/embed/{m[1]}",
                "abrir": f"https://www.youtube.com/watch?v={m[1]}"}
    if m := _YT_LISTA.search(url):
        return {"plataforma": "youtube", "embed": f"https://www.youtube-nocookie.com/embed/videoseries?list={m[1]}",
                "abrir": f"https://www.youtube.com/playlist?list={m[1]}"}
    if m := _SPOTIFY.search(url):
        return {"plataforma": "spotify", "embed": f"https://open.spotify.com/embed/{m[1]}/{m[2]}",
                "abrir": f"https://open.spotify.com/{m[1]}/{m[2]}"}
    return None


def crear_podcast(db: Session, usuario: Usuario, datos: PodcastCrear, offline: bool = False) -> tuple[Podcast, bool]:
    client_id = datos.client_id
    if existente := buscar_por_client_id(db, Podcast, client_id):
        return existente, True
    enlace = analizar_enlace(datos.url)
    if not enlace:
        raise ErrorNegocio("El enlace no es de YouTube ni de Spotify. Copia el enlace del video o del episodio.", 422)
    titulo = datos.titulo.strip() or ("Podcast en YouTube" if enlace["plataforma"] == "youtube" else "Podcast en Spotify")
    podcast = Podcast(
        client_id=client_id,
        usuario_id=usuario.id,
        comunidad=comunidad_salud(usuario),
        titulo=titulo,
        visibilidad=Visibilidad.afuera if datos.compartir else Visibilidad.adentro,
        origen=campos_sync(client_id, None, offline)["origen"],
        **enlace,
    )
    db.add(podcast)
    db.flush()
    return podcast, False


def listar_lugares(db: Session, categoria: str | None) -> list[Lugar]:
    q = select(Lugar).order_by(Lugar.id)
    if categoria:
        q = q.where(Lugar.categoria == categoria)
    return list(db.scalars(q))


def _normalizar(texto: str) -> str:
    """Minúsculas y sin tildes: «Estómago» coincide con «estomago»."""
    return "".join(c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn")


def listar_plantas(db: Session, usuario: Usuario | None, comunidad: Comunidad | None, busqueda: str | None = None) -> list[Planta]:
    """Gobernanza: sin sesión (o desde otra comunidad) solo se ven las plantas que su comunidad decidió
    compartir («afuera»); el integrante verificado ve además las de su propia comunidad («adentro»)."""
    q = select(Planta).order_by(Planta.id)
    if usuario and usuario.comunidad:
        q = q.where((Planta.visibilidad == Visibilidad.afuera) | (Planta.comunidad == usuario.comunidad))
    else:
        q = q.where(Planta.visibilidad == Visibilidad.afuera)
    if comunidad:
        q = q.where(Planta.comunidad == comunidad)
    plantas = list(db.scalars(q))
    if busqueda and (clave := _normalizar(busqueda).strip()):
        # Por nombre, nombre nativo o dolencia (uso y preparación); todas las palabras deben aparecer
        palabras = clave.split()
        def coincide(p: Planta) -> bool:
            pajar = _normalizar(" ".join(filter(None, [p.nombre, p.nombre_nativo, p.cientifico, p.uso, p.preparacion])))
            return all(w in pajar for w in palabras)
        plantas = [p for p in plantas if coincide(p)]
    return plantas


def crear_planta(db: Session, usuario: Usuario, datos: PlantaCrear, offline: bool = False) -> tuple[Planta, bool]:
    """Aporta una planta a la comunidad verificada de la persona (nunca a otra) y evita duplicados si se reenvía."""
    client_id = datos.client_id
    if existente := buscar_por_client_id(db, Planta, client_id):
        return existente, True
    comunidad = comunidad_salud(usuario)
    nombre = datos.nombre.strip()
    planta = Planta(
        slug=f"{re.sub(r'[^a-z0-9]+', '-', _normalizar(nombre)).strip('-')[:28] or 'planta'}-{uuid4().hex[:8]}",
        comunidad=comunidad,
        nombre=nombre,
        nombre_nativo=(datos.nombre_nativo or "").strip() or None,
        cientifico=None,
        color="#E2ECE0",
        uso=datos.uso.strip(),
        preparacion=datos.preparacion.strip(),
        parte_utilizada=(datos.parte_utilizada or "").strip() or None,
        precaucion=datos.precaucion.strip(),
        hospital="Si hay señales de alarma o no mejora, ve al centro de salud.",
        visibilidad=Visibilidad.afuera if datos.compartir else Visibilidad.adentro,
        validada=False,
        autor_nombre=usuario.nombre,
        usuario_id=usuario.id,
        origen=campos_sync(client_id, None, offline)["origen"],
        client_id=client_id,
    )
    db.add(planta)
    db.flush()
    return planta, False


def listar_historias(db: Session) -> list[HistoriaProducto]:
    q = select(HistoriaProducto).where(HistoriaProducto.visibilidad == Visibilidad.afuera).order_by(HistoriaProducto.id)
    return list(db.scalars(q))


def listar_encuentros(db: Session, usuario: Usuario | None, ventana: Ventana) -> list[Encuentro]:
    q = select(Encuentro).where(_filtro_ventana(Encuentro, usuario, ventana)).order_by(Encuentro.id)
    return list(db.scalars(q))


def listar_investigaciones(db: Session, usuario: Usuario | None) -> list[Investigacion]:
    todas = list(db.scalars(select(Investigacion).order_by(Investigacion.id)))
    if not usuario or not usuario.comunidad:
        return todas if not usuario else []
    return [i for i in todas if usuario.comunidad.value in i.comunidades]
