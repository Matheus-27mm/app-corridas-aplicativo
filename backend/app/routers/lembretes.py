from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Lembrete, User
from ..schemas import LembreteBase, LembreteOut
from ..security import get_current_user

router = APIRouter(prefix="/lembretes", tags=["lembretes"])


def _get_owned(lembrete_id: str, user: User, db: Session) -> Lembrete:
    lembrete = db.get(Lembrete, lembrete_id)
    if not lembrete or lembrete.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lembrete não encontrado")
    return lembrete


@router.get("", response_model=list[LembreteOut])
def listar(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Lembrete]:
    return (
        db.query(Lembrete)
        .filter(Lembrete.user_id == user.id)
        .order_by(Lembrete.data.asc())
        .all()
    )


@router.post("", response_model=LembreteOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: LembreteBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Lembrete:
    lembrete = Lembrete(user_id=user.id, **body.model_dump())
    db.add(lembrete)
    db.commit()
    db.refresh(lembrete)
    return lembrete


@router.put("/{lembrete_id}", response_model=LembreteOut)
def atualizar(
    lembrete_id: str,
    body: LembreteBase,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Lembrete:
    lembrete = _get_owned(lembrete_id, user, db)
    for key, value in body.model_dump().items():
        setattr(lembrete, key, value)
    db.commit()
    db.refresh(lembrete)
    return lembrete


@router.delete("/{lembrete_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    lembrete_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    lembrete = _get_owned(lembrete_id, user, db)
    db.delete(lembrete)
    db.commit()
