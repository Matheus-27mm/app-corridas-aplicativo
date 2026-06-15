from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Despesa, User
from ..schemas import DespesaBase, DespesaOut
from ..security import get_current_user

router = APIRouter(prefix="/despesas", tags=["despesas"])


def _get_owned(despesa_id: str, user: User, db: Session) -> Despesa:
    despesa = db.get(Despesa, despesa_id)
    if not despesa or despesa.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Despesa não encontrada")
    return despesa


@router.get("", response_model=list[DespesaOut])
def listar(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Despesa]:
    return (
        db.query(Despesa)
        .filter(Despesa.user_id == user.id)
        .order_by(Despesa.data.desc())
        .all()
    )


@router.post("", response_model=DespesaOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: DespesaBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Despesa:
    despesa = Despesa(user_id=user.id, **body.model_dump())
    db.add(despesa)
    db.commit()
    db.refresh(despesa)
    return despesa


@router.put("/{despesa_id}", response_model=DespesaOut)
def atualizar(
    despesa_id: str,
    body: DespesaBase,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Despesa:
    despesa = _get_owned(despesa_id, user, db)
    for key, value in body.model_dump().items():
        setattr(despesa, key, value)
    db.commit()
    db.refresh(despesa)
    return despesa


@router.delete("/{despesa_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    despesa_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    despesa = _get_owned(despesa_id, user, db)
    db.delete(despesa)
    db.commit()
