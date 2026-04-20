from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

# Shared defaults for the bundled LLM stack (ModelScope OpenAI-compatible inference).
# Do not commit API keys; set SMARTEATS_OPENAI_API_KEY in .env (see .env.example).
_DEFAULT_LLM_BASE_URL = "https://api-inference.modelscope.cn/v1"
_DEFAULT_LLM_MODEL = "ZhipuAI/GLM-5.1"


def _default_database_url() -> str:
    if os.name == "posix":
        return "mysql+pymysql://root@localhost/smarteats?unix_socket=/var/run/mysqld/mysqld.sock"
    return "mysql+pymysql://smarteats_app:change_me@127.0.0.1:3306/smarteats"


def _parse_allowed_origins() -> list[str]:
    raw_value = os.getenv("SMARTEATS_ALLOWED_ORIGINS", "*")
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


def _parse_bool(env_name: str, default: bool) -> bool:
    raw_value = os.getenv(env_name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(slots=True)
class Settings:
    app_name: str = os.getenv("SMARTEATS_APP_NAME", "SmartEats Control Center")
    database_url: str = os.getenv("SMARTEATS_DATABASE_URL", _default_database_url())
    allowed_origins: list[str] = field(default_factory=_parse_allowed_origins)
    host: str = os.getenv("SMARTEATS_HOST", "0.0.0.0")
    port: int = int(os.getenv("SMARTEATS_PORT", "8000"))
    session_secret_key: str = os.getenv("SMARTEATS_SESSION_SECRET_KEY", "change-me-in-production")
    session_cookie_name: str = os.getenv("SMARTEATS_SESSION_COOKIE_NAME", "smarteats_session")
    session_https_only: bool = _parse_bool("SMARTEATS_SESSION_HTTPS_ONLY", False)
    admin_username: str = os.getenv("SMARTEATS_ADMIN_USERNAME", "admin")
    admin_password_hash: str = os.getenv("SMARTEATS_ADMIN_PASSWORD_HASH", "")
    openai_api_key: str = os.getenv("SMARTEATS_OPENAI_API_KEY", "").strip()
    openai_base_url: str = os.getenv("SMARTEATS_OPENAI_BASE_URL", _DEFAULT_LLM_BASE_URL).strip()
    llm_model: str = os.getenv("SMARTEATS_LLM_MODEL", _DEFAULT_LLM_MODEL).strip()


settings = Settings()
