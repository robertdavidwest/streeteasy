"""Search management routes."""
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import uuid
import secrets

from src.core.database import get_db
from src.models.user import User
from src.models.search import Search, SearchMember, SearchInvitation, MemberRole
from src.models.favorite import Favorite
from src.schemas.search import (
    SearchCreate,
    SearchUpdate,
    SearchResponse,
    SearchListResponse,
    SearchMemberResponse,
    InviteMemberRequest,
    AcceptInvitationRequest,
    UpdateMemberRoleRequest,
    SearchInvitationResponse,
    MemberRoleEnum
)
from src.services.auth import get_current_user

router = APIRouter(prefix="/searches", tags=["searches"])


def check_member_permission(
    search_id: str,
    user: User,
    db: Session,
    required_role: Optional[MemberRoleEnum] = None
) -> SearchMember:
    """Check if user has access to a search and optionally a specific role."""
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

    if required_role:
        role_hierarchy = {
            MemberRoleEnum.viewer: 0,
            MemberRoleEnum.editor: 1,
            MemberRoleEnum.owner: 2
        }

        if role_hierarchy.get(member.role.value) < role_hierarchy.get(required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role} role or higher"
            )

    return member


@router.post("", response_model=SearchResponse)
def create_search(
    search_data: SearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Search:
    """Create a new search."""
    # Create the search
    search = Search(
        id=uuid.uuid4(),
        name=search_data.name,
        description=search_data.description,
        created_by=current_user.id
    )
    db.add(search)

    # Add creator as owner
    member = SearchMember(
        id=uuid.uuid4(),
        search_id=search.id,
        user_id=current_user.id,
        role=MemberRole.owner,
        accepted_at=datetime.utcnow()
    )
    db.add(member)

    db.commit()
    db.refresh(search)

    # Load relationships and compute response
    search = (
        db.query(Search)
        .options(joinedload(Search.members).joinedload(SearchMember.user))
        .filter(Search.id == search.id)
        .first()
    )

    # Build response
    response = SearchResponse(
        id=search.id,
        name=search.name,
        description=search.description,
        created_by=search.created_by,
        created_at=search.created_at,
        updated_at=search.updated_at,
        members=[
            SearchMemberResponse(
                id=m.id,
                user_id=m.user_id,
                user_email=m.user.email,
                role=m.role.value,
                invited_by=m.invited_by,
                invited_at=m.invited_at,
                accepted_at=m.accepted_at,
                created_at=m.created_at
            )
            for m in search.members
        ],
        favorites_count=0,
        user_role=MemberRole.owner.value
    )

    return response


@router.get("", response_model=List[SearchListResponse])
def list_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[SearchListResponse]:
    """List all searches the current user has access to."""
    # Get searches where user is a member
    searches = (
        db.query(
            Search,
            SearchMember.role,
            func.count(Favorite.id).label("favorites_count"),
            func.count(func.distinct(SearchMember.user_id)).label("member_count")
        )
        .join(SearchMember, Search.id == SearchMember.search_id)
        .outerjoin(Favorite, Search.id == Favorite.search_id)
        .filter(SearchMember.user_id == current_user.id)
        .group_by(Search.id, SearchMember.role)
        .all()
    )

    return [
        SearchListResponse(
            id=search.id,
            name=search.name,
            description=search.description,
            created_by=search.created_by,
            created_at=search.created_at,
            favorites_count=favorites_count,
            member_count=member_count,
            user_role=role.value
        )
        for search, role, favorites_count, member_count in searches
    ]


@router.get("/{search_id}", response_model=SearchResponse)
def get_search(
    search_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> SearchResponse:
    """Get details of a specific search."""
    # Check permissions
    member = check_member_permission(search_id, current_user, db)

    # Get search with members
    search = (
        db.query(Search)
        .options(joinedload(Search.members).joinedload(SearchMember.user))
        .filter(Search.id == search_id)
        .first()
    )

    if not search:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Search not found"
        )

    # Count favorites
    favorites_count = db.query(Favorite).filter(Favorite.search_id == search_id).count()

    return SearchResponse(
        id=search.id,
        name=search.name,
        description=search.description,
        created_by=search.created_by,
        created_at=search.created_at,
        updated_at=search.updated_at,
        members=[
            SearchMemberResponse(
                id=m.id,
                user_id=m.user_id,
                user_email=m.user.email,
                role=m.role.value,
                invited_by=m.invited_by,
                invited_at=m.invited_at,
                accepted_at=m.accepted_at,
                created_at=m.created_at
            )
            for m in search.members
        ],
        favorites_count=favorites_count,
        user_role=member.role.value
    )


@router.put("/{search_id}", response_model=SearchResponse)
def update_search(
    search_id: str,
    search_data: SearchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> SearchResponse:
    """Update a search (requires editor role or higher)."""
    # Check permissions - need at least editor role
    member = check_member_permission(search_id, current_user, db, MemberRoleEnum.editor)

    # Get and update search
    search = db.query(Search).filter(Search.id == search_id).first()

    if search_data.name is not None:
        search.name = search_data.name
    if search_data.description is not None:
        search.description = search_data.description

    search.updated_at = datetime.utcnow()
    db.commit()

    return get_search(search_id, db, current_user)


@router.delete("/{search_id}")
def delete_search(
    search_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Delete a search (requires owner role)."""
    # Check permissions - need owner role
    check_member_permission(search_id, current_user, db, MemberRoleEnum.owner)

    # Delete search (cascades to members, favorites, invitations)
    search = db.query(Search).filter(Search.id == search_id).first()
    db.delete(search)
    db.commit()

    return {"message": "Search deleted successfully"}


@router.post("/{search_id}/members", response_model=SearchInvitationResponse)
def invite_member(
    search_id: str,
    invite_data: InviteMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> SearchInvitationResponse:
    """Invite a user to join a search (requires editor role or higher)."""
    # Check permissions
    check_member_permission(search_id, current_user, db, MemberRoleEnum.editor)

    # Check if user already exists with this email
    invited_user = db.query(User).filter(User.email == invite_data.email).first()

    if invited_user:
        # Check if already a member
        existing_member = (
            db.query(SearchMember)
            .filter(
                SearchMember.search_id == search_id,
                SearchMember.user_id == invited_user.id
            )
            .first()
        )

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this search"
            )

        # Add as pending member
        member = SearchMember(
            id=uuid.uuid4(),
            search_id=search_id,
            user_id=invited_user.id,
            role=invite_data.role,
            invited_by=current_user.id,
            invited_at=datetime.utcnow(),
            accepted_at=None  # Pending acceptance
        )
        db.add(member)

    # Create invitation (for email notification)
    invitation = SearchInvitation(
        id=uuid.uuid4(),
        search_id=search_id,
        email=invite_data.email,
        invited_by=current_user.id,
        token=secrets.token_urlsafe(32),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(invitation)
    db.commit()

    # Get search name for response
    search = db.query(Search).filter(Search.id == search_id).first()

    return SearchInvitationResponse(
        id=invitation.id,
        search_id=invitation.search_id,
        search_name=search.name,
        email=invitation.email,
        invited_by=invitation.invited_by,
        inviter_email=current_user.email,
        token=invitation.token,
        expires_at=invitation.expires_at,
        created_at=invitation.created_at
    )


@router.post("/invitations/accept")
def accept_invitation(
    accept_data: AcceptInvitationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Accept an invitation to join a search."""
    # Find invitation
    invitation = (
        db.query(SearchInvitation)
        .filter(
            SearchInvitation.token == accept_data.token,
            SearchInvitation.email == current_user.email
        )
        .first()
    )

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation"
        )

    if invitation.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )

    # Check if already a member (from direct add)
    member = (
        db.query(SearchMember)
        .filter(
            SearchMember.search_id == invitation.search_id,
            SearchMember.user_id == current_user.id
        )
        .first()
    )

    if member:
        # Update acceptance
        member.accepted_at = datetime.utcnow()
    else:
        # Create new member
        member = SearchMember(
            id=uuid.uuid4(),
            search_id=invitation.search_id,
            user_id=current_user.id,
            role=MemberRole.viewer,  # Default role
            invited_by=invitation.invited_by,
            invited_at=invitation.created_at,
            accepted_at=datetime.utcnow()
        )
        db.add(member)

    # Delete invitation
    db.delete(invitation)
    db.commit()

    return {"message": "Invitation accepted successfully"}


@router.delete("/{search_id}/members/{member_id}")
def remove_member(
    search_id: str,
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Remove a member from a search (requires owner role)."""
    # Check permissions
    check_member_permission(search_id, current_user, db, MemberRoleEnum.owner)

    # Find member
    member = (
        db.query(SearchMember)
        .filter(
            SearchMember.search_id == search_id,
            SearchMember.id == member_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # Can't remove the last owner
    if member.role == MemberRole.owner:
        owner_count = (
            db.query(SearchMember)
            .filter(
                SearchMember.search_id == search_id,
                SearchMember.role == MemberRole.owner
            )
            .count()
        )

        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last owner"
            )

    db.delete(member)
    db.commit()

    return {"message": "Member removed successfully"}


@router.put("/{search_id}/members/{member_id}/role")
def update_member_role(
    search_id: str,
    member_id: str,
    role_data: UpdateMemberRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """Update a member's role (requires owner role)."""
    # Check permissions
    check_member_permission(search_id, current_user, db, MemberRoleEnum.owner)

    # Find member
    member = (
        db.query(SearchMember)
        .filter(
            SearchMember.search_id == search_id,
            SearchMember.id == member_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # Can't remove the last owner
    if member.role == MemberRole.owner and role_data.role != MemberRoleEnum.owner:
        owner_count = (
            db.query(SearchMember)
            .filter(
                SearchMember.search_id == search_id,
                SearchMember.role == MemberRole.owner
            )
            .count()
        )

        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change role of the last owner"
            )

    member.role = MemberRole(role_data.role)
    db.commit()

    return {"message": "Member role updated successfully"}