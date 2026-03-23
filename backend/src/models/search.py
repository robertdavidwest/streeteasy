"""
Search model - represents a collection of rental listings.
"""
from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from .base import Base


class MemberRole(enum.Enum):
    """Roles for search members."""
    owner = "owner"
    editor = "editor"
    viewer = "viewer"


class Search(Base):
    """A search/collection that groups rental listings."""

    __tablename__ = "searches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="created_searches")
    members = relationship("SearchMember", back_populates="search", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="search", cascade="all, delete-orphan")
    invitations = relationship("SearchInvitation", back_populates="search", cascade="all, delete-orphan")


class SearchMember(Base):
    """Association between users and searches with roles."""

    __tablename__ = "search_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    search_id = Column(UUID(as_uuid=True), ForeignKey("searches.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.viewer)
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    invited_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    search = relationship("Search", back_populates="members")
    user = relationship("User", foreign_keys=[user_id], back_populates="search_memberships")
    inviter = relationship("User", foreign_keys=[invited_by])


class SearchInvitation(Base):
    """Pending invitations to join a search."""

    __tablename__ = "search_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    search_id = Column(UUID(as_uuid=True), ForeignKey("searches.id"), nullable=False)
    email = Column(String, nullable=False)
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    search = relationship("Search", back_populates="invitations")
    inviter = relationship("User")