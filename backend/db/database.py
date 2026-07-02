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
                    text("DROP INDEX IF EXISTS uq_cats_source_url_name")
                )
                # Case-insensitive dedup: first drop older duplicates that only
                # differ by name casing, then enforce (source_url, lower(name)).
                await conn.execute(
                    text(
                        "DELETE FROM cats a USING cats b "
                        "WHERE a.source_url = b.source_url "
                        "AND lower(a.name) = lower(b.name) AND a.id <> b.id "
                        "AND (a.scraped_at < b.scraped_at "
                        "OR (a.scraped_at = b.scraped_at AND a.id < b.id))"
                    )
                )
                await conn.execute(
                    text(
                        "CREATE UNIQUE INDEX IF NOT EXISTS "
                        "uq_cats_source_lower_name "
                        "ON cats (source_url, lower(name))"
                    )
                )
                # One-off cleanup: SHOUTY names from source sites -> Title Case
                # (done in Python — SQL initcap mangles Czech diacritics in
                # C-locale databases).
                rows = (
                    await conn.execute(text("SELECT id, name FROM cats"))
                ).all()
                for row_id, name in rows:
                    if isinstance(name, str) and len(name) >= 2 and name.isupper():
                        await conn.execute(
                            text("UPDATE cats SET name = :n WHERE id = :i"),
                            {"n": name.title(), "i": row_id},
                        )
                # Incremental scraping: listing_url tracks which page a cat
                # was found on (create_all doesn't add columns to old tables).
                await conn.execute(
                    text(
                        "ALTER TABLE cats ADD COLUMN IF NOT EXISTS "
                        "listing_url VARCHAR(1024) NOT NULL DEFAULT ''"
                    )
                )
                await conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS ix_cats_listing_url "
                        "ON cats (listing_url)"
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
