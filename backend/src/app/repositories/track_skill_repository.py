"""Repository for managing track-skill relationships."""

from typing import List, Dict
from uuid import UUID
from sqlmodel import Session
from app.models.skill import Skill, TrackSkill
from app.repositories import learning_item_skill_repository as base


def list_skills_for_track(session: Session, track_id: UUID) -> List[Skill]:
    """Get all skills for a track."""
    return base.list_skills_for_item(session, TrackSkill, "track_id", track_id)


def clear_track_skills(session: Session, track_id: UUID) -> None:
    """Remove all skill associations for a track."""
    base.clear_item_skills(session, TrackSkill, "track_id", track_id)


def insert_track_skills_ignore(session: Session, track_id: UUID, skill_ids: List[str]) -> None:
    """Insert track-skill associations, ignoring duplicates."""
    base.insert_item_skills_ignore(session, "track_skills", "track_id", track_id, skill_ids)


def list_skills_for_tracks(session: Session, track_ids: List[UUID]) -> Dict[str, List[str]]:
    """Get skills for multiple tracks in one query."""
    return base.list_skills_for_items(session, TrackSkill, "track_id", track_ids)
