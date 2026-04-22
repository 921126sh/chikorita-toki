from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    toki_db_url: str = "postgresql://chikorita:password@localhost:5432/chikorita_toki"
    app_port: int = 8002
    secret_key: str = "changeme"
    openweather_api_key: str = ""
    openweather_city: str = "Seoul"
    openweather_country: str = "KR"

    class Config:
        env_file = ".env"


settings = Settings()
