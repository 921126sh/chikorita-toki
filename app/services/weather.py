import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from app.config import settings
from app.schemas import WeatherResponse

_cache: Optional[WeatherResponse] = None
_cache_until: datetime = datetime.now(timezone.utc)
CACHE_TTL = timedelta(minutes=30)


def _parse_weather_id(weather_id: int, main: str) -> Tuple[str, str, bool]:
    """Returns (condition, intensity, has_thunder) from OpenWeatherMap weather ID."""

    # Thunderstorm: 200–232
    if 200 <= weather_id <= 232:
        if weather_id in (210, 211):
            intensity = "moderate"
        elif weather_id == 212:
            intensity = "heavy"
        elif weather_id in (200, 230):
            intensity = "light"
        else:
            intensity = "moderate"
        return "thunderstorm", intensity, True

    # Drizzle: 300–321
    if 300 <= weather_id <= 321:
        if weather_id in (302, 312, 314):
            intensity = "moderate"
        else:
            intensity = "light"
        return "drizzle", intensity, False

    # Rain: 500–531
    if 500 <= weather_id <= 531:
        if weather_id == 500:
            return "rain", "light", False
        elif weather_id == 501:
            return "rain", "moderate", False
        elif weather_id in (502, 522):
            return "rain", "heavy", False
        elif weather_id in (503, 504):
            return "rain", "extreme", False
        elif weather_id in (520, 521, 531):
            return "rain", "moderate", False
        else:
            return "rain", "moderate", False

    # Snow: 600–622
    if 600 <= weather_id <= 622:
        if weather_id in (602, 622):
            intensity = "heavy"
        elif weather_id in (601, 611, 612, 613):
            intensity = "moderate"
        else:
            intensity = "light"
        return "snow", intensity, False

    # Atmosphere: 701–781
    if 700 <= weather_id <= 781:
        return "mist", "light", False

    # Clear
    if weather_id == 800:
        return "clear", "light", False

    # Clouds: 801–804
    return "clouds", "light", False


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

        weather_id = data["weather"][0]["id"]
        main = data["weather"][0]["main"].lower()
        description = data["weather"][0]["description"]
        temp = data["main"]["temp"]
        city = data["name"]

        condition, intensity, has_thunder = _parse_weather_id(weather_id, main)

        _cache = WeatherResponse(
            condition=condition,
            intensity=intensity,
            has_thunder=has_thunder,
            description=description,
            temp=round(temp, 1),
            city=city,
            updated_at=now,
        )
        _cache_until = now + CACHE_TTL
        return _cache

    except Exception:
        return _cache
