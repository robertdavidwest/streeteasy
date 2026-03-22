"""Favorite schemas."""
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Literal

from .rental import RentalResponse
from .event import EventResponse

# State type definition
FavoriteState = Literal[
    "interested",
    "reached_out",
    "showing_scheduled",
    "viewed",
    "applied",
    "rejected",
]


class FavoriteCreate(BaseModel):
    """Schema for creating a favorite."""

    rental_id: str


class FavoriteUpdate(BaseModel):
    """Schema for updating a favorite's state."""

    current_state: FavoriteState
    showing_datetime: Optional[datetime] = None


class FavoriteResponse(BaseModel):
    """Schema for favorite response."""

    id: int
    user_id: UUID
    rental_id: str
    current_state: str
    showing_datetime: Optional[datetime] = None
    state_updated_at: datetime
    created_at: datetime
    updated_at: datetime
    rental: Optional[RentalResponse] = None
    events: list[EventResponse] = []

    class Config:
        """Pydantic config."""

        from_attributes = True
