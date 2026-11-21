"""Enumeraciones compartidas por los modelos."""
import enum

from sqlalchemy import Enum as SAEnum


class Comunidad(str, enum.Enum):
    indigena = "indigena"
    afro = "afro"
    campesina = "campesina"


class Visibilidad(str, enum.Enum):
    """Gobernanza de datos.

    adentro: solo lo ve la comunidad dueña.
    afuera:  la comunidad autorizó mostrarlo en la puerta «Conocer».
    """
    adentro = "adentro"
    afuera = "afuera"


class OrigenSync(str, enum.Enum):
    """Cómo llegó el registro al servidor."""
    en_linea = "en_linea"          # enviado con señal
    cola_offline = "cola_offline"  # guardado sin señal y sincronizado después (POST /api/sync)


def enum_col(e: type[enum.Enum], name: str) -> SAEnum:
    """Enum guardado como VARCHAR + CHECK (más fácil de migrar que un ENUM nativo de PostgreSQL)."""
    return SAEnum(
        e,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=20,
        values_callable=lambda x: [m.value for m in x],
        validate_strings=True,
    )
