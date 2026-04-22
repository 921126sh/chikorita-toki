from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from app.database import get_db
from app.models import TokiUser, TokiEgg, TokiSession
from app.schemas import EggResponse, EggNameRequest

router = APIRouter(prefix="/api/egg", tags=["egg"])


def _days_since(dt: datetime) -> int:
    now = datetime.now(timezone.utc)
    adopted = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
    return (now - adopted).days


def _get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> TokiUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="로그인이 필요해요")
    token = authorization.removeprefix("Bearer ").strip()
    session = db.query(TokiSession).filter(TokiSession.token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="유효하지 않은 세션이에요")
    return session.user


@router.get("/me", response_model=EggResponse)
def get_my_egg(user: TokiUser = Depends(_get_current_user)):
    egg = user.egg
    if not egg:
        raise HTTPException(status_code=404, detail="알을 찾을 수 없어요")
    return EggResponse(
        nickname=user.nickname,
        egg_name=egg.name,
        adopted_at=egg.adopted_at,
        days=_days_since(egg.adopted_at),
        last_interaction_at=egg.last_interaction_at,
    )


@router.patch("/name", response_model=EggResponse)
def set_egg_name(
    body: EggNameRequest,
    user: TokiUser = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    egg = user.egg
    if not egg:
        raise HTTPException(status_code=404, detail="알을 찾을 수 없어요")
    egg.name = body.name
    db.commit()
    db.refresh(egg)
    return EggResponse(
        nickname=user.nickname,
        egg_name=egg.name,
        adopted_at=egg.adopted_at,
        days=_days_since(egg.adopted_at),
        last_interaction_at=egg.last_interaction_at,
    )


@router.post("/touch", response_model=EggResponse)
def touch_egg(
    user: TokiUser = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    egg = user.egg
    if not egg:
        raise HTTPException(status_code=404, detail="알을 찾을 수 없어요")
    egg.last_interaction_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(egg)
    return EggResponse(
        nickname=user.nickname,
        egg_name=egg.name,
        adopted_at=egg.adopted_at,
        days=_days_since(egg.adopted_at),
        last_interaction_at=egg.last_interaction_at,
    )
