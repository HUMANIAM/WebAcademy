from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

from app.utils.model_helpers import generate_id

class LearningTrack(SQLModel, table=True):
    __tablename__ = "learning_tracks"
    
    id: str = Field(default_factory=generate_id, primary_key=True)
    title: str = Field(nullable=False)
    short_description: str = Field(nullable=False)
    level: Optional[str] = Field(default=None)
    estimated_time: Optional[str] = Field(default=None)
    image_url: str = Field(nullable=False)
    
    created_by_user_id: str = Field(nullable=False)  # Set from authenticated user
    created_at: datetime = Field(default_factory=datetime.utcnow)
