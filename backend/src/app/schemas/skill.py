"""Skill schemas for API requests and responses."""

from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel

class SkillRead(BaseModel):
    id: UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

class SkillSearchResponse(BaseModel):
    query: str
    total_count: int
    skills: List[SkillRead]

# ----------------------------
# Resource <-> Skill mapping
# ----------------------------
class ResourceSkillsUpsertRequest(BaseModel):
    """Set the skills for a resource using names.

    Backend behavior:
    - normalize names (trim/lower/slug if you want)
    - upsert missing skills into Skill table
    - rewrite resource_skills links to match the final set
    """
    skill_names: List[str]

class TrackSkillsUpsertRequest(BaseModel):
    """Set the skills for a track using names.

    Backend behavior:
    - normalize names (trim/lower)
    - upsert missing skills into Skill table
    - rewrite track_skills links to match the final set
    """
    skill_names: List[str]