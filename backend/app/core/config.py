from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Codex POS"
    debug: bool = True

    database_url: str = "postgresql+psycopg2://codex:codex@db:5432/codex_pos"
    jwt_secret: str = "change-me"
    jwt_expires_minutes: int = 60
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
