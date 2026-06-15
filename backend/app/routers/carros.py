from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Carro, User
from ..schemas import CarroBase, CarroOut
from ..security import get_current_user

router = APIRouter(prefix="/carros", tags=["carros"])


def _get_owned(carro_id: str, user: User, db: Session) -> Carro:
    carro = db.get(Carro, carro_id)
    if not carro or carro.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carro não encontrado")
    return carro


@router.get("", response_model=list[CarroOut])
def listar(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Carro]:
    return db.query(Carro).filter(Carro.user_id == user.id).order_by(Carro.marca).all()


@router.post("", response_model=CarroOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: CarroBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Carro:
    carro = Carro(user_id=user.id, **body.model_dump())
    db.add(carro)
    db.commit()
    db.refresh(carro)
    return carro


@router.put("/{carro_id}", response_model=CarroOut)
def atualizar(
    carro_id: str,
    body: CarroBase,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Carro:
    carro = _get_owned(carro_id, user, db)
    for key, value in body.model_dump().items():
        setattr(carro, key, value)
    db.commit()
    db.refresh(carro)
    return carro


@router.delete("/{carro_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    carro_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    carro = _get_owned(carro_id, user, db)
    db.delete(carro)
    db.commit()
