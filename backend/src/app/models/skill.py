"""Skill model for the learning platform."""

from datetime import datetime
from app.utils.model_helpers import generate_id

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, String, ForeignKey, Index, UniqueConstraint, func

class Skill(SQLModel, table=True):
    """Skill table model."""
    __tablename__ = "skills"
    
    id: str = Field(default_factory=generate_id, primary_key=True, max_length=32)
    name: str = Field(sa_column=Column(String(255), nullable=False, unique=True, index=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()))
    
    @classmethod
    def normalize_name(cls, name: str) -> str:
        """Normalize skill name by trimming and collapsing spaces."""
        return " ".join(name.strip().split())    


class ResourceSkill(SQLModel, table=True):
    """Resource-Skill junction table model."""
    __tablename__ = "resource_skills"
    __table_args__ = (
        Index("idx_resource_skills_resource_id", "resource_id"),
        Index("idx_resource_skills_skill_id", "skill_id"),
    )
    
    resource_id: str = Field(
        sa_column=Column(String(32), ForeignKey("learning_resources.id", ondelete="CASCADE"), primary_key=True)
    )

    skill_id: str = Field(
        sa_column=Column(String(32), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    )

class TrackSkill(SQLModel, table=True):
    """Track-Skill junction table model."""
    __tablename__ = "track_skills"
    
    __table_args__ = (
        UniqueConstraint("track_id", "skill_id", name="uq_track_skill"),
        Index("ix_track_skills_skill_id", "skill_id"),
        Index("ix_track_skills_track_id", "track_id"),
    )

    track_id: str = Field(
        sa_column=Column(String(32), ForeignKey("learning_tracks.id", ondelete="CASCADE"), primary_key=True)
    )

    skill_id: str = Field(
        sa_column=Column(String(32), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    )
