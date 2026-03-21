"""Events routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.user import User
from src.models.favorite import Favorite
from src.models.event import Event
from src.schemas.event import EventCreate, EventUpdate, EventResponse
from src.services.auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/{favorite_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    favorite_id: int,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Event:
    """Add an event to a favorite."""
    # Check if favorite exists and belongs to user
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

    # Create event
    event = Event(favorite_id=favorite_id, **event_data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)

    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Event:
    """Update an event."""
    # Get event and check ownership
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    # Check that favorite belongs to current user
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == event.favorite_id,
            Favorite.user_id == current_user.id,
        )
        .first()
    )
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event",
        )

    # Update event
    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an event."""
    # Get event and check ownership
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    # Check that favorite belongs to current user
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == event.favorite_id,
            Favorite.user_id == current_user.id,
        )
        .first()
    )
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event",
        )

    db.delete(event)
    db.commit()
