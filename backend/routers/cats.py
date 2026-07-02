"""Cat listing and detail endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.database import get_session
from db.models import Cat
from schemas import CatDetail, CatList

router = APIRouter(prefix="/api/v1/cats", tags=["cats"])


@router.get("", response_model=CatList)
async def list_cats(
    gender: str | None = Query(None),
    age_category: str | None = Query(None),
    shelter_id: int | None = Query(None),
    location: str | None = Query(None),
    status: str | None = Query("available"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> CatList:
    filters = []
    if gender:
        filters.append(Cat.gender == gender)
    if age_category:
        filters.append(Cat.age_category == age_category)
    if shelter_id is not None:
        filters.append(Cat.shelter_id == shelter_id)
    if location:
        filters.append(Cat.location.ilike(f"%{location}%"))
    if status:
        filters.append(Cat.status == status)

    total_stmt = select(func.count()).select_from(Cat)
    if filters:
        total_stmt = total_stmt.where(*filters)
    total = (await session.execute(total_stmt)).scalar_one()

    stmt = (
        select(Cat)
        .order_by(Cat.scraped_at.desc(), Cat.id.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    if filters:
        stmt = stmt.where(*filters)
    cats = (await session.execute(stmt)).scalars().all()

    return CatList(total=total, page=page, per_page=per_page, cats=cats)


@router.get("/{cat_id}", response_model=CatDetail)
async def get_cat(
    cat_id: int,
    session: AsyncSession = Depends(get_session),
) -> CatDetail:
    stmt = (
        select(Cat)
        .where(Cat.id == cat_id)
        .options(selectinload(Cat.shelter))
    )
    cat = (await session.execute(stmt)).scalar_one_or_none()
    if cat is None:
        raise HTTPException(status_code=404, detail="Cat not found")
    return cat
