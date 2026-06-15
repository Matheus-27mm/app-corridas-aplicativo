from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Definicoes, User
from ..schemas import DefinicoesBase, DefinicoesOut
from ..security import get_current_user

router = APIRouter(prefix="/definicoes", tags=["definicoes"])


def _get_or_create(user: User, db: Session) -> Definicoes:
    defi = db.get(Definicoes, user.id)
    if not defi:
        defi = Definicoes(user_id=user.id, moeda="EUR")
        db.add(defi)
        db.commit()
        db.refresh(defi)
    return defi


@router.get("", response_model=DefinicoesOut)
def obter(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Definicoes:
    return _get_or_create(user, db)


@router.put("", response_model=DefinicoesOut)
def atualizar(
    body: DefinicoesBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Definicoes:
    defi = _get_or_create(user, db)
    for key, value in body.model_dump().items():
        setattr(defi, key, value)
    db.commit()
    db.refresh(defi)
    return defi
