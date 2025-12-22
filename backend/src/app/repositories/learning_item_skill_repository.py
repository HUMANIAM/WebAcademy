"""Base repository for managing skill relationships with learning items (resources, tracks)."""

from typing import List, Dict, Type
from uuid import UUID
from sqlmodel import Session, select, SQLModel
from sqlalchemy import delete
from app.models.skill import Skill
from app.utils.model_helpers import bind_values_clause, exec_sql


def list_skills_for_item(
    session: Session,
    junction_model: Type[SQLModel],
    item_id_column: str,
    item_id: UUID
) -> List[Skill]:
    """Get all skills for a learning item."""
    item_id_attr = getattr(junction_model, item_id_column)
    stmt = (
        select(Skill)
        .join(junction_model, junction_model.skill_id == Skill.id)
        .where(item_id_attr == item_id.hex)
        .order_by(Skill.name)
    )
    return list(session.exec(stmt).all())


def clear_item_skills(
    session: Session,
    junction_model: Type[SQLModel],
    item_id_column: str,
    item_id: UUID
) -> None:
    """Remove all skill associations for a learning item."""
    item_id_attr = getattr(junction_model, item_id_column)
    session.exec(delete(junction_model).where(item_id_attr == item_id.hex))


def insert_item_skills_ignore(
    session: Session,
    table_name: str,
    item_id_column: str,
    item_id: UUID,
    skill_ids: List[str]
) -> None:
    """Insert skill associations, ignoring duplicates."""
    if not skill_ids:
        return

    rows_data = [{item_id_column: item_id.hex, "skill_id": sid} for sid in skill_ids]
    values_clause, params = bind_values_clause([item_id_column, "skill_id"], rows_data)
    exec_sql(session, f"INSERT OR IGNORE INTO {table_name} ({item_id_column}, skill_id) VALUES {values_clause}", **params)


def list_skills_for_items(
    session: Session,
    junction_model: Type[SQLModel],
    item_id_column: str,
    item_ids: List[UUID]
) -> Dict[str, List[str]]:
    """Get skills for multiple learning items in one query."""
    if not item_ids:
        return {}
    
    item_hex_ids = [iid.hex for iid in item_ids]
    item_id_attr = getattr(junction_model, item_id_column)
    
    stmt = (
        select(Skill.name, item_id_attr)
        .join(junction_model, junction_model.skill_id == Skill.id)
        .where(item_id_attr.in_(item_hex_ids))
        .order_by(item_id_attr, Skill.name)
    )
    
    results = session.exec(stmt).all()
    
    # Group skills by item_id
    skills_by_item: Dict[str, List[str]] = {}
    for skill_name, item_id in results:
        if item_id not in skills_by_item:
            skills_by_item[item_id] = []
        skills_by_item[item_id].append(skill_name)
    
    return skills_by_item
