from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.schemas.user import UserResponse
from app.schemas.response import APIResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=APIResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's profile."""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    # Create profile if it doesn't exist
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return APIResponse(
        success=True,
        data={
            "user": UserResponse.model_validate(current_user).model_dump(),
            "profile": ProfileResponse.model_validate(profile).model_dump()
        }
    )


@router.put("", response_model=APIResponse)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile."""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    # Create profile if it doesn't exist
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Update fields if provided
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data={
            "user": UserResponse.model_validate(current_user).model_dump(),
            "profile": ProfileResponse.model_validate(profile).model_dump()
        }
    )
