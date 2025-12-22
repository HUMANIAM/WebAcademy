from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict


class ResourceCreate(BaseModel):
    title: str
    short_description: str
    url: str
    platform: str  # 'Udemy', 'Coursera', 'Other'
    resource_type: str  # 'course', 'book', 'article', 'video', etc.
    level: Optional[str] = None # beginner, intermediate, advanced
    estimated_time: Optional[str] = None
    skills: List[str] = [] 
    author: Optional[str] = None
    image_url: Optional[str] = None
    default_funding_type: str  # 'gift_code', 'reimbursement', 'virtual_card', 'org_subscription'
    created_by_user_id: Optional[UUID] = None  # Set by backend from authenticated user


class ResourceRead(BaseModel):
    id: UUID
    title: str
    short_description: str
    url: str
    platform: str
    resource_type: str
    level: Optional[str] = None
    estimated_time: Optional[str] = None
    skills: List[str] = [] 
    author: Optional[str] = None
    image_url: str
    default_funding_type: str
    created_by_user_id: str  # UUID hex string
    created_at: datetime
    provider_metadata: Dict
    
    class Config:
        from_attributes = True


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    url: Optional[str] = None
    platform: Optional[str] = None
    resource_type: Optional[str] = None
    level: Optional[str] = None
    estimated_time: Optional[str] = None
    skills: List[str] = None
    author: Optional[str] = None
    image_url: Optional[str] = None
    default_funding_type: Optional[str] = None


class ResourceLookupResponse(BaseModel):
    exists: bool
    normalized_url: str
    resource: Optional[ResourceRead] = None