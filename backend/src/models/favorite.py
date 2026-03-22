"""Favorite model."""
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    ForeignKey,
    UniqueConstraint,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base

if TYPE_CHECKING:
    from .user import User
    from .event import Event


class Favorite(Base):
    """Favorited rental listing."""

    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rental_id = Column(String, ForeignKey("rentals.id"), nullable=False)
    current_state = Column(
        String, nullable=False, default="interested"
    )  # interested, reached_out, showing_scheduled, viewed, applied, rejected
    showing_datetime = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    state_updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Unique constraint: user can only favorite a rental once
    __table_args__ = (
        UniqueConstraint("user_id", "rental_id", name="uq_user_rental"),
    )

    # Relationships
    user = relationship("User", back_populates="favorites")
    rental = relationship("Rental")
    events = relationship(
        "Event", back_populates="favorite", cascade="all, delete-orphan"
    )
