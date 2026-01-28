from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import shutil
from pathlib import Path
from datetime import datetime
import secrets

from app.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.schemas.user import UserResponse
from app.schemas.response import APIResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

# Configuration for file uploads
UPLOAD_DIR = Path("static/uploads")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )


def save_upload_file(file: UploadFile, user_id: int, file_type: str) -> str:
    """Save uploaded file and return the file path."""
    validate_image_file(file)

    file_ext = Path(file.filename).suffix.lower()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    random_suffix = secrets.token_hex(4)
    filename = f"{file_type}_{user_id}_{timestamp}_{random_suffix}{file_ext}"

    file_path = UPLOAD_DIR / filename

    # Check file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB"
        )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    return f"/static/uploads/{filename}"


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


@router.post("/upload-avatar", response_model=APIResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile avatar image."""
    file_path = save_upload_file(file, current_user.id, "avatar")

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Delete old avatar file if exists
    if profile.avatar_url and profile.avatar_url.startswith("/static/uploads/"):
        old_file_path = Path(profile.avatar_url[1:])
        if old_file_path.exists():
            try:
                old_file_path.unlink()
            except Exception:
                pass

    profile.avatar_url = file_path
    db.commit()
    db.refresh(profile)

    return APIResponse(
        success=True,
        message="Avatar uploaded successfully",
        data={"avatar_url": file_path}
    )


@router.post("/upload-cover", response_model=APIResponse)
async def upload_cover_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile cover photo."""
    file_path = save_upload_file(file, current_user.id, "cover")

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Delete old cover photo file if exists
    if profile.cover_photo_url and profile.cover_photo_url.startswith("/static/uploads/"):
        old_file_path = Path(profile.cover_photo_url[1:])
        if old_file_path.exists():
            try:
                old_file_path.unlink()
            except Exception:
                pass

    profile.cover_photo_url = file_path
    db.commit()
    db.refresh(profile)

    return APIResponse(
        success=True,
        message="Cover photo uploaded successfully",
        data={"cover_photo_url": file_path}
    )
