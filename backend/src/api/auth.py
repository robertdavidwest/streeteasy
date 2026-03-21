"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, Token
from services.auth import (
    validate_password_strength,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)) -> User:
    """
    Register a new user.

    Only allows first user to sign up, then disables registration.
    """
    # Check if any users exist
    existing_user_count = db.query(User).count()
    if existing_user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is closed. First user already registered.",
        )

    # Check if email already exists (redundant but good practice)
    existing_user = (
        db.query(User).filter(User.email == user_data.email).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Validate password strength
    try:
        validate_password_strength(user_data.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )

    # Create user
    hashed_pw = hash_password(user_data.password)
    new_user = User(email=user_data.email, password_hash=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(
    user_data: UserCreate, db: Session = Depends(get_db)
) -> dict[str, str]:
    """Login and get JWT token."""
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(
        user_data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Get current user info."""
    return current_user
