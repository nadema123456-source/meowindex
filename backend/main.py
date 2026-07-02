"""MeowIndex API — FastAPI application entry point."""
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import init_db
from routers import cats, scrape, shelters, stats

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup for local/dev convenience. Production uses Alembic.
    await init_db()
    yield


app = FastAPI(
    title="MeowIndex API",
    description="AI-powered cat adoption aggregator from Czech shelters.",
    version="1.0.0",
    lifespan=lifespan,
)

# Public API — allow all origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cats.router)
app.include_router(shelters.router)
app.include_router(stats.router)
app.include_router(scrape.router)


@app.get("/", tags=["meta"])
async def root():
    return {"service": "MeowIndex API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}
