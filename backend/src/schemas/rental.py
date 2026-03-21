"""Rental schemas."""
from pydantic import BaseModel


class RentalResponse(BaseModel):
    """Schema for rental response."""

    id: str
    url: str
    bedrooms: int
    bathrooms: float
    price: int

    class Config:
        """Pydantic config."""

        from_attributes = True
