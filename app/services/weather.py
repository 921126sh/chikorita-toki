import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.config import settings
from app.schemas import WeatherResponse

_cache: Optional[WeatherResponse] = None
_cache_until: datetime = datetime.now(timezone.utc)
CACHE_TTL = timedelta(minutes=30)

CONDITION_MAP = {
    "clear": "clear",
    "clouds": "clouds",
    "rain": "rain",
    "drizzle": "rain",
    "thunderstorm": "thunderstorm",
    "snow": "snow",
    "mist": "mist",
    "smoke": "mist",
    "haze": "mist",
    "dust": "mist",
    "fog": "mist",
    "sand": "mist",
    "ash": "mist",
    "squall": "rain",
    "tornado": "thunderstorm",
}


async def get_weather() -> Optional[WeatherResponse]:
    global _cache, _cache_until

    now = datetime.now(timezone.utc)
    if _cache and now < _cache_until:
        return _cache

    if not settings.openweather_api_key:
        return None

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": f"{settings.openweather_city},{settings.openweather_country}",
        "appid": settings.openweather_api_key,
        "units": "metric",
        "lang": "kr",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        raw_condition = data["weather"][0]["main"].lower()
        condition = CONDITION_MAP.get(raw_condition, "clear")
        description = data["weather"][0]["description"]
        temp = data["main"]["temp"]
        city = data["name"]

        _cache = WeatherResponse(
            condition=condition,
            description=description,
            temp=round(temp, 1),
            city=city,
            updated_at=now,
        )
        _cache_until = now + CACHE_TTL
        return _cache

    except Exception:
        return _cache
