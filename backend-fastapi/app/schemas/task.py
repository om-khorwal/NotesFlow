from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field("pending", pattern=r"^(pending|in_progress|completed)$")
    priority: Optional[str] = Field("medium", pattern=r"^(low|medium|high)$")
    due_date: Optional[datetime] = None
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(pending|in_progress|completed)$")
    priority: Optional[str] = Field(None, pattern=r"^(low|medium|high)$")
    due_date: Optional[datetime] = None
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_pinned: Optional[bool] = None


class TaskColorUpdate(BaseModel):
    color: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    background_color: Optional[str] = "#FFFFFF"
    is_pinned: bool = False
    share_token: Optional[str] = None
    share_expires_at: Optional[datetime] = None
    is_public: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TaskStatsResponse(BaseModel):
    total: int
    statusCounts: Dict[str, int]
    priorityCounts: Dict[str, int]
