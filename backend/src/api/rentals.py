"""Rental listings routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.rental import Rental
from src.models.user import User
from src.schemas.rental import RentalResponse
from src.services.auth import get_current_user

router = APIRouter(prefix="/rentals", tags=["rentals"])


@router.get("", response_model=list[RentalResponse])
def list_rentals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Rental]:
    """
    List all rental listings with optional filters.

    Ordered by ID descending (most recent first).
    """
    query = db.query(Rental)

    # Apply filters
    if min_price is not None:
        query = query.filter(Rental.price >= min_price)
    if max_price is not None:
        query = query.filter(Rental.price <= max_price)
    if min_bedrooms is not None:
        query = query.filter(Rental.bedrooms >= min_bedrooms)
    if max_bedrooms is not None:
        query = query.filter(Rental.bedrooms <= max_bedrooms)
    if search is not None:
        # Replace spaces with hyphens to match URL format
        search_term = search.replace(" ", "-")
        query = query.filter(Rental.url.ilike(f"%{search_term}%"))

    # Order by ID descending and paginate
    rentals = (
        query.order_by(Rental.id.desc()).offset(skip).limit(limit).all()
    )
    return rentals


@router.get("/{rental_id}", response_model=RentalResponse)
def get_rental(
    rental_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Rental:
    """Get a single rental by ID."""
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rental not found"
        )
    return rental
