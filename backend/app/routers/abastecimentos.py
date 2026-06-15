from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Abastecimento, User
from ..schemas import AbastecimentoBase, AbastecimentoOut
from ..security import get_current_user

router = APIRouter(prefix="/abastecimentos", tags=["abastecimentos"])


def _get_owned(item_id: str, user: User, db: Session) -> Abastecimento:
    item = db.get(Abastecimento, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Abastecimento não encontrado"
        )
    return item


@router.get("", response_model=list[AbastecimentoOut])
def listar(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Abastecimento]:
    return (
        db.query(Abastecimento)
        .filter(Abastecimento.user_id == user.id)
        .order_by(Abastecimento.data.desc())
        .all()
    )


@router.post("", response_model=AbastecimentoOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: AbastecimentoBase,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Abastecimento:
    item = Abastecimento(user_id=user.id, **body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=AbastecimentoOut)
def atualizar(
    item_id: str,
    body: AbastecimentoBase,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Abastecimento:
    item = _get_owned(item_id, user, db)
    for key, value in body.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    item_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    item = _get_owned(item_id, user, db)
    db.delete(item)
    db.commit()
