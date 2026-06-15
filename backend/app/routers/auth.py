from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Definicoes, User
from ..schemas import LoginIn, RegisterIn, TokenOut, UserOut
from ..security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    exists = db.query(User).filter(User.email == body.email).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já registado")

    user = User(nome=body.nome, email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    db.flush()
    db.add(Definicoes(user_id=user.id, moeda="EUR", meta_diaria=80, meta_mensal=1800))
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
        )
    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user
