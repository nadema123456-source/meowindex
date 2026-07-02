"""ORM models for shelters and cats."""
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class Shelter(Base):
    __tablename__ = "shelters"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    website: Mapped[str] = mapped_column(String(512), nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    cats: Mapped[list["Cat"]] = relationship(
        back_populates="shelter", cascade="all, delete-orphan"
    )


class Cat(Base):
    __tablename__ = "cats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    gender: Mapped[str] = mapped_column(String(16), default="")
    age_text: Mapped[str] = mapped_column(String(128), default="")
    age_category: Mapped[str] = mapped_column(String(32), default="adult")
    shelter_id: Mapped[int] = mapped_column(
        ForeignKey("shelters.id", ondelete="CASCADE"), nullable=False
    )
    location: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSONB, default=list)
    image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    source_url: Mapped[str] = mapped_column(String(1024), default="")
    status: Mapped[str] = mapped_column(String(32), default="available")
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    shelter: Mapped["Shelter"] = relationship(back_populates="cats")

    __table_args__ = (
        Index("ix_cats_gender", "gender"),
        Index("ix_cats_age_category", "age_category"),
        Index("ix_cats_status", "status"),
        Index("ix_cats_shelter_id", "shelter_id"),
        # Dedup guard: same cat profile from the same source shouldn't double-insert.
        Index("uq_cats_source_url", "source_url", unique=True),
    )
