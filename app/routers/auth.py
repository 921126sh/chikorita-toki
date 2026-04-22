import secrets
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TokiUser, TokiEgg, TokiSession
from app.schemas import RegisterRequest, LoginRequest, AuthResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _days_since(dt: datetime) -> int:
    now = datetime.now(timezone.utc)
    adopted = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
    return (now - adopted).days


def _make_token() -> str:
    return secrets.token_hex(32)


def _hash_pin(pin: str) -> str:
    return bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode()


def _check_pin(pin: str, hashed: str) -> bool:
    return bcrypt.checkpw(pin.encode(), hashed.encode())


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(TokiUser).filter(TokiUser.nickname == body.nickname).first()
    if existing:
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임이에요")

    user = TokiUser(
        nickname=body.nickname,
        pin_hash=_hash_pin(body.pin),
    )
    db.add(user)
    db.flush()

    egg = TokiEgg(user_id=user.id)
    db.add(egg)

    token = _make_token()
    session = TokiSession(user_id=user.id, token=token)
    db.add(session)

    db.commit()
    db.refresh(egg)

    return AuthResponse(
        token=token,
        nickname=user.nickname,
        egg_name=egg.name,
        adopted_at=egg.adopted_at,
        days=_days_since(egg.adopted_at),
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(TokiUser).filter(TokiUser.nickname == body.nickname).first()
    if not user or not _check_pin(body.pin, user.pin_hash):
        raise HTTPException(status_code=401, detail="닉네임 또는 PIN이 맞지 않아요")

    # 기존 세션 갱신
    session = db.query(TokiSession).filter(TokiSession.user_id == user.id).first()
    token = _make_token()
    if session:
        session.token = token
    else:
        session = TokiSession(user_id=user.id, token=token)
        db.add(session)

    db.commit()

    egg = user.egg
    return AuthResponse(
        token=token,
        nickname=user.nickname,
        egg_name=egg.name if egg else None,
        adopted_at=egg.adopted_at if egg else datetime.now(timezone.utc),
        days=_days_since(egg.adopted_at) if egg else 0,
    )
