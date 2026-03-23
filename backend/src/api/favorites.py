"""Favorites routes."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from src.core.database import get_db
from src.models.user import User
from src.models.favorite import Favorite
from src.models.rental import Rental
from src.models.event import Event, EventType
from src.models.search import Search, SearchMember, MemberRole
from src.schemas.favorite import FavoriteCreate, FavoriteUpdate, FavoriteResponse
from src.services.auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["favorites"])


def check_search_access(
    search_id: str,
    user: User,
    db: Session,
    require_edit: bool = False
) -> SearchMember:
    """Check if user has access to a search."""
    member = (
        db.query(SearchMember)
        .filter(
            SearchMember.search_id == search_id,
            SearchMember.user_id == user.id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Search not found or access denied"
        )

    if require_edit and member.role == MemberRole.viewer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires editor role or higher"
        )

    return member


@router.get("", response_model=list[FavoriteResponse])
def list_favorites(
    search_id: Optional[str] = Query(None, description="Filter by search ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Favorite]:
    """List favorites, optionally filtered by search."""
    query = db.query(Favorite)

    if search_id:
        # Check access to the search
        check_search_access(search_id, current_user, db)
        query = query.filter(Favorite.search_id == search_id)
    else:
        # Get all favorites from searches user has access to
        user_searches = (
            db.query(SearchMember.search_id)
            .filter(SearchMember.user_id == current_user.id)
            .subquery()
        )
        query = query.filter(Favorite.search_id.in_(user_searches))

    favorites = (
        query
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
    """Add a rental to a search."""
    # Check access to the search (must have edit permission)
    check_search_access(favorite_data.search_id, current_user, db, require_edit=True)

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

    # Check if already favorited in this search
    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.rental_id == favorite_data.rental_id,
            Favorite.search_id == favorite_data.search_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rental already added to this search",
        )

    # Create favorite
    favorite = Favorite(
        user_id=current_user.id,
        rental_id=favorite_data.rental_id,
        search_id=favorite_data.search_id
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


@router.put("/{favorite_id}", response_model=FavoriteResponse)
def update_favorite(
    favorite_id: int,
    update_data: FavoriteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Favorite:
    """Update a favorite's state."""
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

    # Record state change as event
    old_state = favorite.current_state
    new_state = update_data.current_state

    if old_state != new_state:
        # Convert state string to EventType enum
        event_type = EventType(new_state)
        event = Event(
            favorite_id=favorite_id,
            event_type=event_type,
            event_date=datetime.utcnow(),
            notes=f"Changed from {old_state}",
        )
        db.add(event)

    # Update favorite state
    favorite.current_state = new_state
    # Only update showing_datetime if explicitly provided
    if update_data.showing_datetime is not None:
        favorite.showing_datetime = update_data.showing_datetime
    # Update not_interested_reason if state is rejected
    if new_state == "rejected" and update_data.not_interested_reason is not None:
        favorite.not_interested_reason = update_data.not_interested_reason
    # Clear the reason if moving away from rejected state
    elif new_state != "rejected":
        favorite.not_interested_reason = None
    # Update interested_reason if state is interested
    if new_state == "interested" and update_data.interested_reason is not None:
        favorite.interested_reason = update_data.interested_reason
    # Update applied_reason if state is applied
    if new_state == "applied" and update_data.applied_reason is not None:
        favorite.applied_reason = update_data.applied_reason
    # Update viewed_reason if state is viewed
    if new_state == "viewed" and update_data.viewed_reason is not None:
        favorite.viewed_reason = update_data.viewed_reason
    # Note: We don't clear these reasons when moving away from their states
    # because the user wants them to be permanent comments
    favorite.state_updated_at = datetime.utcnow()

    db.commit()
    db.refresh(favorite)

    # Load relationships
    favorite = (
        db.query(Favorite)
        .filter(Favorite.id == favorite.id)
        .options(joinedload(Favorite.rental), joinedload(Favorite.events))
        .first()
    )

    return favorite


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Soft delete a favorite."""
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

    favorite.is_deleted = True
    db.commit()


@router.patch("/{favorite_id}/restore", status_code=status.HTTP_204_NO_CONTENT)
def restore_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Restore a soft-deleted favorite."""
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == favorite_id,
            Favorite.user_id == current_user.id,
            Favorite.is_deleted == True,
        )
        .first()
    )
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deleted favorite not found",
        )

    favorite.is_deleted = False
    db.commit()


@router.delete("/{favorite_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def permanently_delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Permanently delete a favorite."""
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == favorite_id,
            Favorite.user_id == current_user.id,
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
