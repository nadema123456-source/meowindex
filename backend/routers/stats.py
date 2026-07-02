"""Aggregate statistics endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.models import Cat, Shelter
from schemas import Stats

router = APIRouter(prefix="/api/v1/stats", tags=["stats"])


@router.get("", response_model=Stats)
async def get_stats(session: AsyncSession = Depends(get_session)) -> Stats:
    # Count only adoptable cats so the landing figure matches the catalog's
    # default (status=available) view.
    total_cats = (
        await session.execute(
            select(func.count()).select_from(Cat).where(Cat.status == "available")
        )
    ).scalar_one()
    total_shelters = (
        await session.execute(select(func.count()).select_from(Shelter))
    ).scalar_one()
    last_scrape = (
        await session.execute(select(func.max(Cat.scraped_at)))
    ).scalar_one_or_none()

    return Stats(
        total_cats=total_cats,
        total_shelters=total_shelters,
        last_scrape=last_scrape,
    )
