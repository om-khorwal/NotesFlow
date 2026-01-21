from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional
from datetime import datetime, timedelta
import secrets

from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskColorUpdate, TaskStatsResponse
from app.schemas.response import APIResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=APIResponse)
def get_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    pinned: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for the current user."""
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if status_filter:
        query = query.filter(Task.status == status_filter)

    if priority:
        query = query.filter(Task.priority == priority)

    if pinned is not None:
        query = query.filter(Task.is_pinned == pinned)

    # Order by pinned first, then by created_at
    tasks = query.order_by(desc(Task.is_pinned), desc(Task.created_at)).all()

    return APIResponse(
        success=True,
        data={
            "tasks": [TaskResponse.model_validate(task).model_dump() for task in tasks],
            "total": len(tasks)
        }
    )


@router.get("/stats", response_model=APIResponse)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task statistics for the current user."""
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    status_counts = {"pending": 0, "in_progress": 0, "completed": 0}
    priority_counts = {"low": 0, "medium": 0, "high": 0}

    for task in tasks:
        if task.status in status_counts:
            status_counts[task.status] += 1
        if task.priority in priority_counts:
            priority_counts[task.priority] += 1

    return APIResponse(
        success=True,
        data={
            "total": len(tasks),
            "statusCounts": status_counts,
            "priorityCounts": priority_counts
        }
    )


@router.get("/{task_id}", response_model=APIResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return APIResponse(
        success=True,
        data=TaskResponse.model_validate(task).model_dump()
    )


@router.post("", response_model=APIResponse)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        status=task_data.status or "pending",
        priority=task_data.priority or "medium",
        due_date=task_data.due_date,
        background_color=task_data.background_color or "#FFFFFF"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return APIResponse(
        success=True,
        message="Task created successfully",
        data=TaskResponse.model_validate(task).model_dump()
    )


@router.put("/{task_id}", response_model=APIResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    update_data = task_data.model_dump(exclude_unset=True)

    # Handle completion timestamp
    if "status" in update_data:
        if update_data["status"] == "completed" and task.status != "completed":
            task.completed_at = datetime.utcnow()
        elif update_data["status"] != "completed":
            task.completed_at = None

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return APIResponse(
        success=True,
        message="Task updated successfully",
        data=TaskResponse.model_validate(task).model_dump()
    )


@router.delete("/{task_id}", response_model=APIResponse)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return APIResponse(
        success=True,
        message="Task deleted successfully"
    )


@router.put("/{task_id}/pin", response_model=APIResponse)
def toggle_pin(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle pin status of a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.is_pinned = not task.is_pinned
    db.commit()
    db.refresh(task)

    return APIResponse(
        success=True,
        message=f"Task {'pinned' if task.is_pinned else 'unpinned'} successfully",
        data=TaskResponse.model_validate(task).model_dump()
    )


@router.put("/{task_id}/color", response_model=APIResponse)
def set_color(
    task_id: int,
    color_data: TaskColorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set the background color of a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.background_color = color_data.color
    db.commit()
    db.refresh(task)

    return APIResponse(
        success=True,
        message="Task color updated successfully",
        data=TaskResponse.model_validate(task).model_dump()
    )


@router.post("/{task_id}/share", response_model=APIResponse)
def create_share_link(
    task_id: int,
    expires_in_days: Optional[int] = Query(None, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a share link for a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Generate unique token
    task.share_token = secrets.token_urlsafe(32)
    task.is_public = True

    if expires_in_days:
        task.share_expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
    else:
        task.share_expires_at = None

    db.commit()
    db.refresh(task)

    return APIResponse(
        success=True,
        message="Share link created successfully",
        data={
            "share_token": task.share_token,
            "share_url": f"/shared.html?type=task&token={task.share_token}",
            "expires_at": task.share_expires_at.isoformat() if task.share_expires_at else None
        }
    )


@router.delete("/{task_id}/share", response_model=APIResponse)
def revoke_share_link(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a share link for a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.share_token = None
    task.is_public = False
    task.share_expires_at = None
    db.commit()

    return APIResponse(
        success=True,
        message="Share link revoked successfully"
    )
