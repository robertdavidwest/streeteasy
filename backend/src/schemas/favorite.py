"""Favorite schemas."""
from datetime import datetime
from pydantic import BaseModel, field_serializer
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
    not_interested_reason: Optional[str] = None


class FavoriteResponse(BaseModel):
    """Schema for favorite response."""

    id: int
    user_id: UUID
    rental_id: str
    current_state: str
    showing_datetime: Optional[datetime] = None
    not_interested_reason: Optional[str] = None
    is_deleted: bool
    state_updated_at: datetime
    created_at: datetime
    updated_at: datetime
    rental: Optional[RentalResponse] = None
    events: list[EventResponse] = []

    @field_serializer('showing_datetime', 'state_updated_at', 'created_at', 'updated_at')
    def serialize_datetime(self, dt: Optional[datetime], _info):
        """Serialize datetime with Z suffix for UTC times."""
        if dt is None:
            return None
        # If datetime is naive (no tzinfo), assume it's UTC and add Z
        if dt.tzinfo is None:
            return dt.isoformat() + 'Z'
        return dt.isoformat()

    class Config:
        """Pydantic config."""

        from_attributes = True
