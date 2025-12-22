from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Index
from datetime import datetime

from app.utils.model_helpers import generate_id

class TrackResource(SQLModel, table=True):
    __tablename__ = "track_resources"

    id: str = Field(default_factory=generate_id, primary_key=True)
    track_id: str = Field(foreign_key="learning_tracks.id", nullable=False)
    resource_id: str = Field(foreign_key="learning_resources.id", nullable=False)
    position: int = Field(nullable=False)  # set explicitly from request order
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("track_id", "resource_id", name="uq_track_resource"),
        UniqueConstraint("track_id", "position", name="uq_track_position"),
        Index("ix_track_resources_resource_id", "resource_id"),
    )