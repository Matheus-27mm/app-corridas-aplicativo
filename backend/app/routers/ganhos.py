from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Ganho, User
from ..schemas import GanhoBase, GanhoOut
from ..security import get_current_user

router = APIRouter(prefix="/ganhos", tags=["ganhos"])


def _get_owned(ganho_id: str, user: User, db: Session) -> Ganho:
    ganho = db.get(Ganho, ganho_id)
    if not ganho or ganho.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ganho não encontrado")
    return ganho


@router.get("", response_model=list[GanhoOut])
def listar(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Ganho]:
    return (
        db.query(Ganho)
        .filter(Ganho.user_id == user.id)
        .order_by(Ganho.data.desc())
        .all()
    )


@router.post("", response_model=GanhoOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: GanhoBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Ganho:
    ganho = Ganho(user_id=user.id, **body.model_dump())
    db.add(ganho)
    db.commit()
    db.refresh(ganho)
    return ganho


@router.put("/{ganho_id}", response_model=GanhoOut)
def atualizar(
    ganho_id: str,
    body: GanhoBase,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Ganho:
    ganho = _get_owned(ganho_id, user, db)
    for key, value in body.model_dump().items():
        setattr(ganho, key, value)
    db.commit()
    db.refresh(ganho)
    return ganho


@router.delete("/{ganho_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    ganho_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    ganho = _get_owned(ganho_id, user, db)
    db.delete(ganho)
    db.commit()
