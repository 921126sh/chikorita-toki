from fastapi import APIRouter
from typing import Optional
from app.schemas import WeatherResponse
from app.services.weather import get_weather

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("", response_model=Optional[WeatherResponse])
async def weather():
    return await get_weather()
