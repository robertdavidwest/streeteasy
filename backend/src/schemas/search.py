"""Search-related Pydantic schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID
from enum import Enum


class MemberRoleEnum(str, Enum):
    """Member roles."""
    owner = "owner"
    editor = "editor"
    viewer = "viewer"


class SearchCreate(BaseModel):
    """Schema for creating a search."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class SearchUpdate(BaseModel):
    """Schema for updating a search."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class SearchMemberResponse(BaseModel):
    """Response schema for search member."""
    id: UUID
    user_id: UUID
    user_email: str
    role: MemberRoleEnum
    invited_by: Optional[UUID] = None
    invited_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Response schema for search."""
    id: UUID
    name: str
    description: Optional[str]
    created_by: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    members: List[SearchMemberResponse] = []
    favorites_count: int = 0
    user_role: Optional[MemberRoleEnum] = None  # Current user's role

    class Config:
        from_attributes = True


class SearchListResponse(BaseModel):
    """Response schema for search list."""
    id: UUID
    name: str
    description: Optional[str]
    created_by: UUID
    created_at: datetime
    favorites_count: int = 0
    member_count: int = 0
    user_role: MemberRoleEnum

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    """Request schema for inviting a member."""
    email: str = Field(..., min_length=3, max_length=254)
    role: MemberRoleEnum = MemberRoleEnum.viewer


class AcceptInvitationRequest(BaseModel):
    """Request schema for accepting an invitation."""
    token: str


class UpdateMemberRoleRequest(BaseModel):
    """Request schema for updating member role."""
    role: MemberRoleEnum


class SearchInvitationResponse(BaseModel):
    """Response schema for search invitation."""
    id: UUID
    search_id: UUID
    search_name: str
    email: str
    invited_by: UUID
    inviter_email: str
    token: str
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True