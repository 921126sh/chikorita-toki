from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class RegisterRequest(BaseModel):
    nickname: str
    pin: str

    @field_validator("nickname")
    @classmethod
    def nickname_valid(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2 or len(v) > 20:
            raise ValueError("닉네임은 2~20자 사이여야 해요")
        return v

    @field_validator("pin")
    @classmethod
    def pin_valid(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 4:
            raise ValueError("PIN은 숫자 4자리여야 해요")
        return v


class LoginRequest(BaseModel):
    nickname: str
    pin: str


class AuthResponse(BaseModel):
    token: str
    nickname: str
    egg_name: Optional[str]
    adopted_at: datetime
    days: int


class EggResponse(BaseModel):
    nickname: str
    egg_name: Optional[str]
    adopted_at: datetime
    days: int
    last_interaction_at: datetime


class EggNameRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 20:
            raise ValueError("이름은 1~20자 사이여야 해요")
        return v


class WeatherResponse(BaseModel):
    condition: str        # clear, clouds, drizzle, rain, heavy_rain, thunderstorm, snow, mist
    intensity: str        # light, moderate, heavy, extreme
    has_thunder: bool
    description: str
    temp: float
    city: str
    updated_at: datetime
