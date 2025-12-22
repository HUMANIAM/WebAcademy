from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Literal, Union
from app.utils.enums import DifficultyLevel
from app.schemas.resource import ResourceCreate


class ExistingResourceRef(BaseModel):
    kind: Literal["existing"] = "existing"
    resource_id: str
    position: int


class NewResourceItem(BaseModel):
    kind: Literal["new"] = "new"
    resource: ResourceCreate
    position: int

TrackResourceItem = Union[ExistingResourceRef, NewResourceItem]


class TrackCreate(BaseModel):
    title: str
    short_description: str
    level:DifficultyLevel
    skills: List[str] = Field(default_factory=list) 
    estimated_time: Optional[str] = None
    image_url: Optional[str] = None
    resources: List[TrackResourceItem] = Field(default_factory=list, min_length=1)
    created_by_user_id: Optional[UUID] = None  # Set by backend from authenticated user


class TrackUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    level: DifficultyLevel
    skills: List[str] = Field(default_factory=list)
    estimated_time: Optional[str] = None
    image_url: Optional[str] = None
    resources: List[TrackResourceItem] = Field(default_factory=list)


class ResourceSummary(BaseModel):
    id: UUID
    title: str
    short_description: str
    type: str
    position: int
    level: DifficultyLevel
    skills: List[str] = Field(default_factory=list)
    estimated_time: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class TrackNameItem(BaseModel):
    """Lightweight track item for dropdowns/autocomplete."""
    id: UUID
    title: str

    class Config:
        from_attributes = True


class TrackRead(BaseModel):
    """Track metadata without resources."""
    id: UUID
    title: str
    short_description: str
    level: DifficultyLevel
    skills: List[str] = Field(default_factory=list)
    estimated_time: Optional[str] = None
    image_url: Optional[str] = None
    created_by_user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TrackReadWithResources(TrackRead):
    """Track with full details including resources."""
    resources: List[ResourceSummary] = Field(default_factory=list, min_length=1)