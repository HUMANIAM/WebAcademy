"""Repository for managing resource-skill relationships."""

from typing import List, Dict
from uuid import UUID
from sqlmodel import Session
from app.models.skill import Skill, ResourceSkill
from app.repositories import learning_item_skill_repository as base


def list_skills_for_resource(session: Session, resource_id: UUID) -> List[Skill]:
    """Get all skills for a resource."""
    return base.list_skills_for_item(session, ResourceSkill, "resource_id", resource_id)


def clear_resource_skills(session: Session, resource_id: UUID) -> None:
    """Remove all skill associations for a resource."""
    base.clear_item_skills(session, ResourceSkill, "resource_id", resource_id)


def insert_resource_skills_ignore(session: Session, resource_id: UUID, skill_ids: List[str]) -> None:
    """Insert resource-skill associations, ignoring duplicates."""
    base.insert_item_skills_ignore(session, "resource_skills", "resource_id", resource_id, skill_ids)


def list_skills_for_resources(session: Session, resource_ids: List[UUID]) -> Dict[str, List[str]]:
    """Get skills for multiple resources in one query."""
    return base.list_skills_for_items(session, ResourceSkill, "resource_id", resource_ids)
