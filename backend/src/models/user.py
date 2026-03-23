"""User model."""
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base

if TYPE_CHECKING:
    from .favorite import Favorite


class User(Base):
    """User account."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    favorites = relationship(
        "Favorite", back_populates="user", cascade="all, delete-orphan"
    )
    created_searches = relationship(
        "Search", back_populates="creator", cascade="all, delete-orphan"
    )
    search_memberships = relationship(
        "SearchMember", foreign_keys="SearchMember.user_id", back_populates="user", cascade="all, delete-orphan"
    )
