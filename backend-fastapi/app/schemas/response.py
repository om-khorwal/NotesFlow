from pydantic import BaseModel
from typing import Optional, Any, List


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class APIResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    errors: Optional[List[ErrorDetail]] = None

    class Config:
        from_attributes = True
