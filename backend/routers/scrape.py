"""Admin-only scraping trigger endpoint."""
import os

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_session
from schemas import ScrapeResult
from scraper.runner import run_all_sources

router = APIRouter(prefix="/api/v1/scrape", tags=["admin"])


def verify_api_key(x_api_key: str | None = Header(None)) -> None:
    expected = os.getenv("SCRAPE_API_KEY")
    if not expected:
        raise HTTPException(
            status_code=500, detail="SCRAPE_API_KEY is not configured on the server"
        )
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


@router.post("", response_model=ScrapeResult, dependencies=[Depends(verify_api_key)])
async def trigger_scrape(
    session: AsyncSession = Depends(get_session),
) -> ScrapeResult:
    cats_scraped, errors = await run_all_sources(session)
    return ScrapeResult(cats_scraped=cats_scraped, errors=errors)
