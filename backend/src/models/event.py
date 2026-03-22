"""Event model."""
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from .base import Base

if TYPE_CHECKING:
    from .favorite import Favorite


class EventType(str, enum.Enum):
    """Event type enum - matches favorite states."""

    INTERESTED = "interested"
    REACHED_OUT = "reached_out"
    SHOWING_SCHEDULED = "showing_scheduled"
    VIEWED = "viewed"
    APPLIED = "applied"
    REJECTED = "rejected"


class Event(Base):
    """Event associated with a favorited rental."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    favorite_id = Column(Integer, ForeignKey("favorites.id"), nullable=False)
    event_type = Column(
        Enum(EventType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    event_date = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    favorite = relationship("Favorite", back_populates="events")
