"""Favorites routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from src.core.database import get_db
from src.models.user import User
from src.models.favorite import Favorite
from src.models.rental import Rental
from src.schemas.favorite import FavoriteCreate, FavoriteResponse
from src.services.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteResponse])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Favorite]:
    """List all favorites for current user."""
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .options(joinedload(Favorite.rental), joinedload(Favorite.events))
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return favorites


@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def create_favorite(
    favorite_data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Favorite:
    """Add a rental to favorites."""
    # Check if rental exists
    rental = (
        db.query(Rental)
        .filter(Rental.id == favorite_data.rental_id)
        .first()
    )
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rental not found"
        )

    # Check if already favorited
    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.rental_id == favorite_data.rental_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rental already favorited",
        )

    # Create favorite
    favorite = Favorite(
        user_id=current_user.id, rental_id=favorite_data.rental_id
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    # Load relationships
    db.refresh(favorite)
    favorite = (
        db.query(Favorite)
        .filter(Favorite.id == favorite.id)
        .options(joinedload(Favorite.rental), joinedload(Favorite.events))
        .first()
    )

    return favorite


@router.get("/{favorite_id}", response_model=FavoriteResponse)
def get_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Favorite:
    """Get a favorite by ID."""
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == favorite_id, Favorite.user_id == current_user.id
        )
        .options(joinedload(Favorite.rental), joinedload(Favorite.events))
        .first()
    )
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
    return favorite


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Remove a favorite."""
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == favorite_id, Favorite.user_id == current_user.id
        )
        .first()
    )
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )

    db.delete(favorite)
    db.commit()
