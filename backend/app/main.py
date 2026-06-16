from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (regista as tabelas no metadata)
from .config import settings
from .database import Base, engine
from .routers import (
    abastecimentos,
    auth,
    carros,
    definicoes,
    despesas,
    export,
    ganhos,
    jornadas,
    lembretes,
    resumo,
)

# Cria as tabelas se não existirem. Corre no arranque local e em cada cold start serverless
# (no Vercel os eventos de lifespan podem não executar, por isso é feito no import).
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:  # noqa: BLE001
    print(f"[startup] Aviso: nao foi possivel criar as tabelas: {exc}")

app = FastAPI(title="GestRun API", version="0.2.0")

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
app.include_router(lembretes.router)
app.include_router(jornadas.router)
app.include_router(export.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
