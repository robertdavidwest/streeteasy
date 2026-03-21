"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api import auth, rentals, favorites, events

# Create FastAPI app
app = FastAPI(
    title="StreetEasyAndMe API",
    description="API for tracking NYC rental listings",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(rentals.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")
app.include_router(events.router, prefix="/api/favorites")


@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "StreetEasyAndMe API"}


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
