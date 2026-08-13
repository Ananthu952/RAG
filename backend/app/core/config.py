from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str

    DEBUG: bool

    HOST: str
    PORT: int

    LOG_LEVEL: str

    UPLOAD_DIR: str
    VECTOR_DB_DIR: str

    DATABASE_URL: str   # <-- This line MUST be present

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )


settings = Settings()