from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional
import secrets
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteColorUpdate, ShareResponse
from app.schemas.response import APIResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("", response_model=APIResponse)
def get_notes(
    search: Optional[str] = Query(None),
    pinned: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notes for the current user."""
    query = db.query(Note).filter(Note.user_id == current_user.id)

    if search:
        query = query.filter(
            or_(
                Note.title.ilike(f"%{search}%"),
                Note.content.ilike(f"%{search}%")
            )
        )

    if pinned is not None:
        query = query.filter(Note.is_pinned == pinned)

    # Order by pinned first, then by updated_at
    notes = query.order_by(desc(Note.is_pinned), desc(Note.updated_at)).all()

    return APIResponse(
        success=True,
        data={
            "notes": [NoteResponse.model_validate(note).model_dump() for note in notes],
            "total": len(notes)
        }
    )


@router.get("/{note_id}", response_model=APIResponse)
def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    return APIResponse(
        success=True,
        data=NoteResponse.model_validate(note).model_dump()
    )


@router.post("", response_model=APIResponse)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new note."""
    note = Note(
        user_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        background_color=note_data.background_color or "#FFFFFF"
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return APIResponse(
        success=True,
        message="Note created successfully",
        data=NoteResponse.model_validate(note).model_dump()
    )


@router.put("/{note_id}", response_model=APIResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Update fields if provided
    update_data = note_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    return APIResponse(
        success=True,
        message="Note updated successfully",
        data=NoteResponse.model_validate(note).model_dump()
    )


@router.delete("/{note_id}", response_model=APIResponse)
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()

    return APIResponse(
        success=True,
        message="Note deleted successfully"
    )


@router.put("/{note_id}/pin", response_model=APIResponse)
def toggle_pin(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle pin status of a note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    note.is_pinned = not note.is_pinned
    db.commit()
    db.refresh(note)

    return APIResponse(
        success=True,
        message=f"Note {'pinned' if note.is_pinned else 'unpinned'} successfully",
        data=NoteResponse.model_validate(note).model_dump()
    )


@router.put("/{note_id}/color", response_model=APIResponse)
def set_color(
    note_id: int,
    color_data: NoteColorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set the background color of a note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    note.background_color = color_data.color
    db.commit()
    db.refresh(note)

    return APIResponse(
        success=True,
        message="Note color updated successfully",
        data=NoteResponse.model_validate(note).model_dump()
    )


@router.post("/{note_id}/share", response_model=APIResponse)
def create_share_link(
    note_id: int,
    expires_in_days: Optional[int] = Query(None, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a share link for a note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Generate unique token
    note.share_token = secrets.token_urlsafe(32)
    note.is_public = True

    if expires_in_days:
        note.share_expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
    else:
        note.share_expires_at = None

    db.commit()
    db.refresh(note)

    return APIResponse(
        success=True,
        message="Share link created successfully",
        data={
            "share_token": note.share_token,
            "share_url": f"/shared.html?token={note.share_token}",
            "expires_at": note.share_expires_at.isoformat() if note.share_expires_at else None
        }
    )


@router.delete("/{note_id}/share", response_model=APIResponse)
def revoke_share_link(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a share link for a note."""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    note.share_token = None
    note.is_public = False
    note.share_expires_at = None
    db.commit()

    return APIResponse(
        success=True,
        message="Share link revoked successfully"
    )
