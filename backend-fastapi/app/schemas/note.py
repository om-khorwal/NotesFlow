from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_pinned: Optional[bool] = None


class NoteColorUpdate(BaseModel):
    color: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")


class NoteResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: Optional[str] = None
    background_color: Optional[str] = "#FFFFFF"
    is_pinned: bool = False
    share_token: Optional[str] = None
    share_expires_at: Optional[datetime] = None
    is_public: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ShareResponse(BaseModel):
    share_token: str
    share_url: str
    expires_at: Optional[datetime] = None


class SharedNoteResponse(BaseModel):
    title: str
    content: Optional[str] = None
    background_color: Optional[str] = "#FFFFFF"
    created_at: datetime

    class Config:
        from_attributes = True
