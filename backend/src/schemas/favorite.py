"""Favorite schemas."""
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

from .rental import RentalResponse
from .event import EventResponse


class FavoriteCreate(BaseModel):
    """Schema for creating a favorite."""

    rental_id: str


class FavoriteResponse(BaseModel):
    """Schema for favorite response."""

    id: int
    user_id: UUID
    rental_id: str
    created_at: datetime
    updated_at: datetime
    rental: Optional[RentalResponse] = None
    events: list[EventResponse] = []

    class Config:
        """Pydantic config."""

        from_attributes = True
