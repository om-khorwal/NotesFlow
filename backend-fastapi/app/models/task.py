from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    priority = Column(String(20), default="medium")  # low, medium, high
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    background_color = Column(String(7), default="#FFFFFF")
    is_pinned = Column(Boolean, default=False)
    share_token = Column(String(64), unique=True, index=True)
    share_expires_at = Column(DateTime)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="tasks")
