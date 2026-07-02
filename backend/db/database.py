"""SQLAlchemy async engine and session management."""
import os

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/meowindex",
)

# Managed Postgres providers (Railway, Heroku, ...) hand out plain
# postgres[ql]:// URLs; SQLAlchemy needs the asyncpg driver in the scheme.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


class Base(DeclarativeBase):
    """Base class for all ORM models."""


engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncSession:
    """FastAPI dependency that yields a database session."""
    async with async_session_maker() as session:
        yield session


async def init_db(retries: int = 10, delay: float = 3.0) -> None:
    """Create all tables, retrying while the database comes up.

    Logs the connection target (host only, no credentials) so a missing
    DATABASE_URL is obvious in deploy logs instead of a bare stack trace.
    """
    import asyncio
    import logging

    from sqlalchemy.engine import make_url

    log = logging.getLogger("uvicorn.error")
    url = make_url(DATABASE_URL)
    target = f"{url.host}:{url.port or 5432}/{url.database}"

    from sqlalchemy import text

    for attempt in range(1, retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # Idempotent index migration: dedup key moved from source_url
                # to (source_url, name) so cats sharing a listing-page URL
                # don't overwrite each other. Old data satisfies the new
                # constraint trivially (source_url alone used to be unique).
                await conn.execute(text("DROP INDEX IF EXISTS uq_cats_source_url"))
                await conn.execute(
                    text(
                        "CREATE UNIQUE INDEX IF NOT EXISTS "
                        "uq_cats_source_url_name ON cats (source_url, name)"
                    )
                )
            log.info("Database ready at %s", target)
            return
        except Exception as exc:  # noqa: BLE001 - retry transient startup errors
            log.warning(
                "DB connect %d/%d to %s failed: %s: %s",
                attempt, retries, target, type(exc).__name__, exc,
            )
            if attempt == retries:
                raise
            await asyncio.sleep(delay)
