"""Pydantic schemas for API request/response serialization."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ShelterBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    website: str
    location: str


class ShelterWithCount(ShelterBase):
    cat_count: int


class CatBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    gender: str
    age_text: str
    age_category: str
    shelter_id: int
    location: str
    description: str | None
    tags: list[str]
    image_url: str | None
    source_url: str
    status: str
    scraped_at: datetime
    created_at: datetime
    updated_at: datetime


class CatDetail(CatBase):
    """Cat with joined shelter information."""

    shelter: ShelterBase | None = None


class CatList(BaseModel):
    total: int
    page: int
    per_page: int
    cats: list[CatBase]


class Stats(BaseModel):
    total_cats: int
    total_shelters: int
    last_scrape: datetime | None


class ScrapeResult(BaseModel):
    cats_scraped: int
    errors: list[str]
