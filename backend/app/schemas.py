from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base: aceita/serializa em camelCase (alinha com o frontend) e lê de ORM."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# --- Auth ---

class RegisterIn(CamelModel):
    nome: str
    email: EmailStr
    password: str


class LoginIn(CamelModel):
    email: EmailStr
    password: str


class UserOut(CamelModel):
    id: str
    nome: str
    email: EmailStr


# Resposta do token em snake_case (convenção OAuth2 — o frontend lê `access_token`).
# `user` continua em camelCase (UserOut).
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Carro ---

class CarroBase(CamelModel):
    marca: str
    modelo: str
    ano: int
    matricula: str
    tipo: str
    consumo_medio: float | None = None


class CarroOut(CarroBase):
    id: str


# --- Ganho ---

class GanhoBase(CamelModel):
    data: date
    plataforma: str
    valor_bruto: float
    num_corridas: int | None = None
    km: float | None = None
    horas: float | None = None
    gorjetas: float | None = None


class GanhoOut(GanhoBase):
    id: str


# --- Abastecimento ---

class AbastecimentoBase(CamelModel):
    data: date
    tipo: str
    quantidade: float
    preco_unitario: float
    total: float
    km_conta: int | None = None


class AbastecimentoOut(AbastecimentoBase):
    id: str


# --- Despesa ---

class DespesaBase(CamelModel):
    data: date
    categoria: str
    descricao: str | None = None
    valor: float


class DespesaOut(DespesaBase):
    id: str


# --- Definições ---

class DefinicoesBase(CamelModel):
    moeda: str = "EUR"
    meta_diaria: float | None = None
    meta_mensal: float | None = None


class DefinicoesOut(DefinicoesBase):
    pass


# --- Resumo / estatísticas ---

class PlataformaResumo(CamelModel):
    plataforma: str
    ganhos: float
    corridas: int
    km: float
    horas: float
    ganhos_por_hora: float | None = None
    ganhos_por_km: float | None = None


class ResumoOut(CamelModel):
    periodo: str
    ganhos: float
    custos: float
    lucro: float
    km: float
    horas: float
    corridas: int
    lucro_por_km: float | None = None
    lucro_por_hora: float | None = None
    plataformas: list[PlataformaResumo]
