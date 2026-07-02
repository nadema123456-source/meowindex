"""Optional seed script — creates shelter rows and a couple of demo cats.

Run with:  python -m db.seed
This is handy for exercising the API/frontend without a live scrape. Real data
comes from POST /api/v1/scrape.
"""
import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from db.database import async_session_maker, init_db
from db.models import Cat, Shelter
from scraper.sources import SOURCES


async def seed() -> None:
    await init_db()
    async with async_session_maker() as session:
        for source in SOURCES:
            exists = (
                await session.execute(
                    select(Shelter).where(Shelter.name == source["name"])
                )
            ).scalar_one_or_none()
            if exists is None:
                session.add(
                    Shelter(
                        name=source["name"],
                        website=source["website"],
                        location=source.get("location", ""),
                    )
                )
        await session.commit()

        # A single demo cat attached to the first shelter, if none exist yet.
        first_shelter = (
            await session.execute(select(Shelter).limit(1))
        ).scalar_one_or_none()
        has_cats = (
            await session.execute(select(Cat).limit(1))
        ).scalar_one_or_none()
        if first_shelter and has_cats is None:
            session.add(
                Cat(
                    name="Mourek",
                    gender="male",
                    age_text="2 roky",
                    age_category="adult",
                    shelter_id=first_shelter.id,
                    location=first_shelter.location,
                    description="Přátelská kočka, která hledá domov.",
                    tags=["friendly", "indoor"],
                    image_url=None,
                    source_url=f"{first_shelter.website}/demo/mourek",
                    status="available",
                    scraped_at=datetime.now(timezone.utc),
                )
            )
            await session.commit()

    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
