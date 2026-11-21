from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import Comunidad


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    numero_identificacion: str
    nombre: str
    comunidad: Comunidad


class LoginIn(BaseModel):
    numero_identificacion: str = Field(min_length=1, max_length=20)
    clave: str = Field(min_length=1, max_length=128)
    # Comunidad elegida en la pantalla de acceso: la cuenta debe pertenecer a ella.
    comunidad: Comunidad | None = None


class RegistroIn(BaseModel):
    nombre: str = Field(max_length=120)
    numero_identificacion: str = Field(max_length=20)
    clave: str = Field(max_length=128)
    comunidad: Comunidad

    @field_validator("nombre")
    @classmethod
    def nombre_completo(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Escribe tu nombre completo.")
        return v

    @field_validator("numero_identificacion")
    @classmethod
    def solo_digitos(cls, v: str) -> str:
        v = "".join(c for c in v if c.isdigit())
        if len(v) < 5:
            raise ValueError("El número de identificación debe tener al menos 5 dígitos.")
        return v

    @field_validator("clave")
    @classmethod
    def clave_minima(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        return v


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut
