"""Skill service for managing skills and learning item-skill relationships."""

from typing import List
from uuid import UUID
from sqlmodel import Session
from app.repositories import skill_repository, resource_skill_repository, track_skill_repository
from app.models.skill import Skill

def _normalize_and_dedupe(names: List[str]) -> List[str]:
    seen = set()
    out = []

    for n in names or []:
        nn = Skill.normalize_name(n)
        if nn and nn not in seen:
            seen.add(nn)
            out.append(nn)

    return out

def set_resource_skills(session: Session, resource_id: UUID, skill_names: List[str], commit: bool = True) -> None:
    """Set skills for a resource (replace semantics)."""
    names = _normalize_and_dedupe(skill_names)

    resource_skill_repository.clear_resource_skills(session, resource_id)

    if names:
        skill_ids = skill_repository.upsert_skills_by_names(session, names)
        resource_skill_repository.insert_resource_skills_ignore(session, resource_id, skill_ids)

    session.flush()
    if commit:
        session.commit()


def set_track_skills(session: Session, track_id: UUID, skill_names: List[str], commit: bool = True) -> None:
    """Set skills for a track (replace semantics)."""
    names = _normalize_and_dedupe(skill_names)

    track_skill_repository.clear_track_skills(session, track_id)

    if names:
        skill_ids = skill_repository.upsert_skills_by_names(session, names)
        track_skill_repository.insert_track_skills_ignore(session, track_id, skill_ids)

    session.flush()
    if commit:
        session.commit()
