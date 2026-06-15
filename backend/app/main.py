from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (regista as tabelas no metadata)
from .config import settings
from .database import Base, engine
from .routers import abastecimentos, auth, carros, definicoes, despesas, ganhos, resumo


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    # Cria as tabelas se não existirem (dev). Em produção pode usar-se Alembic.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Corrida API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(carros.router)
app.include_router(ganhos.router)
app.include_router(abastecimentos.router)
app.include_router(despesas.router)
app.include_router(definicoes.router)
app.include_router(resumo.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
