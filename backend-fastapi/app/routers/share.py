from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.note import Note
from app.models.task import Task
from app.schemas.note import SharedNoteResponse
from app.schemas.response import APIResponse

router = APIRouter(prefix="/share", tags=["Share"])


@router.get("/note/{token}", response_model=APIResponse)
def get_shared_note(
    token: str,
    db: Session = Depends(get_db)
):
    """Get a publicly shared note by its token."""
    note = db.query(Note).filter(
        Note.share_token == token,
        Note.is_public == True
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared note not found or link has been revoked"
        )

    # Check if the share link has expired
    if note.share_expires_at and note.share_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link has expired"
        )

    return APIResponse(
        success=True,
        data={
            "type": "note",
            "title": note.title,
            "content": note.content,
            "background_color": note.background_color,
            "created_at": note.created_at.isoformat()
        }
    )


@router.get("/task/{token}", response_model=APIResponse)
def get_shared_task(
    token: str,
    db: Session = Depends(get_db)
):
    """Get a publicly shared task by its token."""
    task = db.query(Task).filter(
        Task.share_token == token,
        Task.is_public == True
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared task not found or link has been revoked"
        )

    # Check if the share link has expired
    if task.share_expires_at and task.share_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This share link has expired"
        )

    return APIResponse(
        success=True,
        data={
            "type": "task",
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "background_color": task.background_color,
            "created_at": task.created_at.isoformat()
        }
    )


# Keep backwards compatibility with old route
@router.get("/{token}", response_model=APIResponse)
def get_shared_item(
    token: str,
    db: Session = Depends(get_db)
):
    """Get a publicly shared item by its token (backwards compatible)."""
    # First try to find a note
    note = db.query(Note).filter(
        Note.share_token == token,
        Note.is_public == True
    ).first()

    if note:
        if note.share_expires_at and note.share_expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This share link has expired"
            )
        return APIResponse(
            success=True,
            data={
                "type": "note",
                "title": note.title,
                "content": note.content,
                "background_color": note.background_color,
                "created_at": note.created_at.isoformat()
            }
        )

    # Then try to find a task
    task = db.query(Task).filter(
        Task.share_token == token,
        Task.is_public == True
    ).first()

    if task:
        if task.share_expires_at and task.share_expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This share link has expired"
            )
        return APIResponse(
            success=True,
            data={
                "type": "task",
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "background_color": task.background_color,
                "created_at": task.created_at.isoformat()
            }
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Shared item not found or link has been revoked"
    )
