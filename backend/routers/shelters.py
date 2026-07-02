"""Shelter listing endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from db.models import Cat, Shelter
from schemas import ShelterWithCount

router = APIRouter(prefix="/api/v1/shelters", tags=["shelters"])


@router.get("", response_model=list[ShelterWithCount])
async def list_shelters(
    session: AsyncSession = Depends(get_session),
) -> list[ShelterWithCount]:
    stmt = (
        select(
            Shelter.id,
            Shelter.name,
            Shelter.website,
            Shelter.location,
            func.count(Cat.id).label("cat_count"),
        )
        .outerjoin(Cat, Cat.shelter_id == Shelter.id)
        .group_by(Shelter.id)
        .order_by(Shelter.name)
    )
    rows = (await session.execute(stmt)).all()
    return [
        ShelterWithCount(
            id=row.id,
            name=row.name,
            website=row.website,
            location=row.location,
            cat_count=row.cat_count,
        )
        for row in rows
    ]
