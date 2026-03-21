"""Event schemas."""
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from models.event import EventType


class EventCreate(BaseModel):
    """Schema for creating an event."""

    event_type: EventType
    event_date: datetime
    notes: Optional[str] = None


class EventUpdate(BaseModel):
    """Schema for updating an event."""

    event_type: Optional[EventType] = None
    event_date: Optional[datetime] = None
    notes: Optional[str] = None


class EventResponse(BaseModel):
    """Schema for event response."""

    id: int
    favorite_id: int
    event_type: EventType
    event_date: datetime
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True
