from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    # サーバー設定
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # LLM設定
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str
    LLM_MODEL_NAME: str = "gpt-3.5-turbo"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 1000

# --- at the top of backend/app/core/config.py ---
from typing import List, Optional
from pathlib import Path

# … other imports …

class AppConfig(BaseSettings):
    # … other settings …

    # TTS設定
    TTS_MODEL_DIR: Optional[str] = None
    TTS_DEFAULT_SPEAKER_ID: int = 0
    TTS_DEFAULT_LANGUAGE: str = "JP"
    TTS_CACHE_ENABLED: bool = True
    TTS_CACHE_DIR: Path = Path("/tmp/tts_cache")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # ensure the cache directory exists
        self.TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    # … rest of the config class …
    # CORS設定
    CORS_ALLOW_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings() 