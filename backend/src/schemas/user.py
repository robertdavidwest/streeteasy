"""User schemas."""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class UserCreate(BaseModel):
    """Schema for creating a user."""

    email: EmailStr
    password: str = Field(min_length=12)


class UserResponse(BaseModel):
    """Schema for user response."""

    id: UUID
    email: str
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""

    user_id: UUID | None = None
