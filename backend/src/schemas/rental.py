"""Rental schemas."""
from typing import Optional
from pydantic import BaseModel


class RentalResponse(BaseModel):
    """Schema for rental response."""

    id: str
    url: str
    bedrooms: int
    bathrooms: float
    price: int
    image_url: Optional[str] = None

    class Config:
        """Pydantic config."""

        from_attributes = True
