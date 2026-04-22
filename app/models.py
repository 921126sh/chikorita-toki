from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class TokiUser(Base):
    __tablename__ = "toki_users"

    id = Column(Integer, primary_key=True)
    nickname = Column(String(50), unique=True, nullable=False, index=True)
    pin_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    egg = relationship("TokiEgg", back_populates="user", uselist=False)
    sessions = relationship("TokiSession", back_populates="user")


class TokiEgg(Base):
    __tablename__ = "toki_eggs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("toki_users.id"), unique=True, nullable=False)
    name = Column(String(50), nullable=True)
    adopted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_interaction_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("TokiUser", back_populates="egg")


class TokiSession(Base):
    __tablename__ = "toki_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("toki_users.id"), nullable=False)
    token = Column(String(64), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("TokiUser", back_populates="sessions")
