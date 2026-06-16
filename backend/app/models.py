import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    primeiro_nome: Mapped[str] = mapped_column(String(80))
    sobrenome: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    data_nascimento: Mapped[date | None] = mapped_column(Date, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Carro(Base):
    __tablename__ = "carros"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    marca: Mapped[str] = mapped_column(String(80))
    modelo: Mapped[str] = mapped_column(String(80))
    ano: Mapped[int] = mapped_column(Integer)
    matricula: Mapped[str] = mapped_column(String(20))
    tipo: Mapped[str] = mapped_column(String(20))
    consumo_medio: Mapped[float | None] = mapped_column(Float, nullable=True)


class Ganho(Base):
    __tablename__ = "ganhos"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, index=True)
    plataforma: Mapped[str] = mapped_column(String(20))
    valor_bruto: Mapped[float] = mapped_column(Float)
    num_corridas: Mapped[int | None] = mapped_column(Integer, nullable=True)
    km: Mapped[float | None] = mapped_column(Float, nullable=True)
    horas: Mapped[float | None] = mapped_column(Float, nullable=True)
    gorjetas: Mapped[float | None] = mapped_column(Float, nullable=True)


class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, index=True)
    tipo: Mapped[str] = mapped_column(String(20))
    quantidade: Mapped[float] = mapped_column(Float)
    preco_unitario: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    km_conta: Mapped[int | None] = mapped_column(Integer, nullable=True)


class Despesa(Base):
    __tablename__ = "despesas"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    data: Mapped[date] = mapped_column(Date, index=True)
    categoria: Mapped[str] = mapped_column(String(20))
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    valor: Mapped[float] = mapped_column(Float)


class Definicoes(Base):
    __tablename__ = "definicoes"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    moeda: Mapped[str] = mapped_column(String(8), default="EUR")
    meta_diaria: Mapped[float | None] = mapped_column(Float, nullable=True)
    meta_mensal: Mapped[float | None] = mapped_column(Float, nullable=True)


class Lembrete(Base):
    __tablename__ = "lembretes"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tipo: Mapped[str] = mapped_column(String(20))
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    data: Mapped[date] = mapped_column(Date, index=True)
