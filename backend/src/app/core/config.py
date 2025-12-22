from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./xlp.db"
    CORS_ORIGINS: str
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()