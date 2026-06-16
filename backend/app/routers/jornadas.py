from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Jornada, User
from ..schemas import JornadaBase, JornadaOut, JornadaUpdate
from ..security import get_current_user

router = APIRouter(prefix="/jornadas", tags=["jornadas"])


def _get_owned(jornada_id: str, user: User, db: Session) -> Jornada:
    jornada = db.get(Jornada, jornada_id)
    if not jornada or jornada.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jornada não encontrada")
    return jornada


@router.get("", response_model=list[JornadaOut])
def listar(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Jornada]:
    return (
        db.query(Jornada)
        .filter(Jornada.user_id == user.id)
        .order_by(Jornada.data.desc())
        .all()
    )


@router.post("", response_model=JornadaOut, status_code=status.HTTP_201_CREATED)
def criar(
    body: JornadaBase, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Jornada:
    # Apenas uma jornada por dia (abrir/fechar o mesmo dia).
    existente = (
        db.query(Jornada)
        .filter(Jornada.user_id == user.id, Jornada.data == body.data)
        .first()
    )
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma jornada para este dia",
        )
    jornada = Jornada(user_id=user.id, **body.model_dump())
    db.add(jornada)
    db.commit()
    db.refresh(jornada)
    return jornada


@router.put("/{jornada_id}", response_model=JornadaOut)
def atualizar(
    jornada_id: str,
    body: JornadaUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Jornada:
    jornada = _get_owned(jornada_id, user, db)
    # Atualização parcial: só altera os campos enviados (ex.: fechar o dia = só km_fim).
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(jornada, key, value)
    db.commit()
    db.refresh(jornada)
    return jornada


@router.delete("/{jornada_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    jornada_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    jornada = _get_owned(jornada_id, user, db)
    db.delete(jornada)
    db.commit()
