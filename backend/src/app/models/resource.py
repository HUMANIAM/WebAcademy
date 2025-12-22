from sqlmodel import SQLModel, Field, Column, JSON, Index
from datetime import datetime
from typing import Optional, Dict

from app.utils.model_helpers import generate_id

class LearningResource(SQLModel, table=True):
    __tablename__ = "learning_resources"
    
    id: str = Field(default_factory=generate_id, primary_key=True)
    title: str = Field(nullable=False)
    short_description: str = Field(nullable=False)
    url: str = Field(nullable=False)
    normalized_url: Optional[str] = Field(default=None)
    platform: str = Field(nullable=False)  # 'Udemy', 'Coursera', 'Other'
    resource_type: str = Field(nullable=False)  # 'Course', 'Project', 'Book', 'Article & Blog', 'Video & Talk'
    level: Optional[str] = Field(default=None)
    estimated_time: Optional[str] = Field(default=None)
    author: Optional[str] = Field(default=None)
    image_url: str = Field(nullable=False)
    default_funding_type: str = Field(nullable=False)  # 'gift_code', 'reimbursement', 'virtual_card', 'org_subscription'
    
    created_by_user_id: str = Field(nullable=False)  # Set from authenticated user
    created_at: datetime = Field(default_factory=datetime.utcnow)
    provider_metadata: Dict = Field(default_factory=dict, sa_column=Column(JSON))

    
