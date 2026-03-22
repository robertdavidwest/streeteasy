"""
Rental model - represents existing rentals table from scraper.

This is a read-only model for the existing table.
"""
from sqlalchemy import Column, Integer, String, Float
from .base import Base


class Rental(Base):
    """Rental listing from StreetEasy scraper."""

    __tablename__ = "rentals"

    id = Column(String, primary_key=True)
    url = Column(String, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)
    price = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
