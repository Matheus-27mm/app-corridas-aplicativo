import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Abastecimento, Despesa, Ganho, User
from ..security import get_current_user

router = APIRouter(prefix="/export", tags=["export"])


def _csv(filename: str, header: list[str], rows: list[list]) -> StreamingResponse:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    writer.writerows(rows)
    buffer.seek(0)
    # BOM para o Excel abrir acentos corretamente.
    content = "﻿" + buffer.getvalue()
    return StreamingResponse(
        iter([content]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/ganhos.csv")
def export_ganhos(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> StreamingResponse:
    items = db.query(Ganho).filter(Ganho.user_id == user.id).order_by(Ganho.data.desc()).all()
    rows = [
        [g.data.isoformat(), g.plataforma, g.valor_bruto, g.num_corridas, g.km, g.horas, g.gorjetas]
        for g in items
    ]
    return _csv(
        "ganhos.csv",
        ["data", "plataforma", "valor_bruto", "num_corridas", "km", "horas", "gorjetas"],
        rows,
    )


@router.get("/abastecimentos.csv")
def export_abastecimentos(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> StreamingResponse:
    items = (
        db.query(Abastecimento)
        .filter(Abastecimento.user_id == user.id)
        .order_by(Abastecimento.data.desc())
        .all()
    )
    rows = [
        [a.data.isoformat(), a.tipo, a.quantidade, a.preco_unitario, a.total, a.km_conta]
        for a in items
    ]
    return _csv(
        "abastecimentos.csv",
        ["data", "tipo", "quantidade", "preco_unitario", "total", "km_conta"],
        rows,
    )


@router.get("/despesas.csv")
def export_despesas(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> StreamingResponse:
    items = db.query(Despesa).filter(Despesa.user_id == user.id).order_by(Despesa.data.desc()).all()
    rows = [[d.data.isoformat(), d.categoria, d.descricao, d.valor] for d in items]
    return _csv("despesas.csv", ["data", "categoria", "descricao", "valor"], rows)
