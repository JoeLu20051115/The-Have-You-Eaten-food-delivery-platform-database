from __future__ import annotations

from functools import lru_cache
from typing import Iterator

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import settings

engine = create_engine(settings.database_url, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


@lru_cache(maxsize=1)
def get_metadata() -> MetaData:
    metadata = MetaData()
    metadata.reflect(bind=engine)
    return metadata


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
