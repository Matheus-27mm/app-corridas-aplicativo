from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field
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
    username: str = Field(min_length=3, max_length=40)
    primeiro_nome: str = Field(min_length=1, max_length=80)
    sobrenome: str = Field(min_length=1, max_length=80)
    email: EmailStr
    data_nascimento: date
    password: str = Field(min_length=6)


class LoginIn(CamelModel):
    login: str  # email ou nome de utilizador
    password: str


class ProfileUpdateIn(CamelModel):
    username: str = Field(min_length=3, max_length=40)
    primeiro_nome: str = Field(min_length=1, max_length=80)
    sobrenome: str = Field(min_length=1, max_length=80)
    email: EmailStr
    data_nascimento: date


class UserOut(CamelModel):
    id: str
    username: str
    primeiro_nome: str
    sobrenome: str
    email: EmailStr
    data_nascimento: date | None = None

    @computed_field
    @property
    def nome(self) -> str:
        return f"{self.primeiro_nome} {self.sobrenome}".strip()


# Resposta do token em snake_case (convenção OAuth2 — o frontend lê `access_token`).
# `user` continua em camelCase (UserOut).
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Carro ---

class CarroBase(CamelModel):
    marca: str = Field(min_length=1, max_length=80)
    modelo: str = Field(min_length=1, max_length=80)
    ano: int = Field(ge=1900, le=2100)
    matricula: str = Field(max_length=20)
    tipo: str
    consumo_medio: float | None = Field(default=None, ge=0)


class CarroOut(CarroBase):
    id: str


# --- Ganho ---

class GanhoBase(CamelModel):
    data: date
    plataforma: str
    valor_bruto: float = Field(ge=0)
    num_corridas: int | None = Field(default=None, ge=0)
    km: float | None = Field(default=None, ge=0)
    horas: float | None = Field(default=None, ge=0)
    gorjetas: float | None = Field(default=None, ge=0)


class GanhoOut(GanhoBase):
    id: str


# --- Abastecimento ---

class AbastecimentoBase(CamelModel):
    data: date
    tipo: str
    quantidade: float = Field(ge=0)
    preco_unitario: float = Field(ge=0)
    total: float = Field(ge=0)
    km_conta: int | None = Field(default=None, ge=0)


class AbastecimentoOut(AbastecimentoBase):
    id: str


# --- Despesa ---

class DespesaBase(CamelModel):
    data: date
    categoria: str
    descricao: str | None = None
    valor: float = Field(ge=0)


class DespesaOut(DespesaBase):
    id: str


# --- Definições ---

class DefinicoesBase(CamelModel):
    moeda: str = "EUR"
    meta_diaria: float | None = Field(default=None, ge=0)
    meta_mensal: float | None = Field(default=None, ge=0)


class DefinicoesOut(DefinicoesBase):
    pass


# --- Lembretes (inspeção, seguro, IUC, etc.) ---

class LembreteBase(CamelModel):
    tipo: str
    descricao: str | None = None
    data: date


class LembreteOut(LembreteBase):
    id: str


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
