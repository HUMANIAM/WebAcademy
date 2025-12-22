from uuid import UUID
from typing import List, Optional, Tuple, Dict
from sqlmodel import Session, select, func
from app.models.resource import LearningResource
from app.utils.model_helpers import dbid


def create(resource: LearningResource, session: Session, commit: bool = True) -> LearningResource:
    """Create a new learning resource."""
    session.add(resource)
    session.flush()

    if commit:
        session.commit()
    
    session.refresh(resource)
    return resource


def get_by_id(resource_id: UUID, session: Session) -> Optional[LearningResource]:
    """Get a learning resource by ID."""
    return session.get(LearningResource, dbid(resource_id))

def get_by_normalized_url(normalized_url: str, session: Session) -> Optional[LearningResource]:
    """Get a learning resource by normalized URL (dedupe key)."""
    if not normalized_url:
        return None
    statement = select(LearningResource).where(LearningResource.normalized_url == normalized_url)
    return session.exec(statement).first()

def list_all(session: Session) -> List[LearningResource]:
    """List all learning resources."""
    statement = select(LearningResource)
    results = session.exec(statement)
    return list(results.all())


def get_by_ids(resource_ids: List[UUID], session: Session) -> Dict[UUID, LearningResource]:
    """Get multiple resources by IDs. Returns dict mapping id -> resource."""
    if not resource_ids:
        return {}

    ids = [dbid(rid) for rid in resource_ids]
    statement = select(LearningResource).where(LearningResource.id.in_(ids))

    results = session.exec(statement).all()
    return {UUID(r.id): r for r in results}


def list_filtered(
    session: Session,
    search: Optional[str] = None,
    skill: Optional[List[str]] = None,
    level: Optional[List[str]] = None,
    resource_type: Optional[List[str]] = None,
    page: int = 1,
    page_size: int = 12
) -> Tuple[List[LearningResource], int]:
    """List learning resources with filtering and pagination."""
    
    def _apply_filters(statement):
        """Apply all filters to a statement."""
        # Apply filters
        if search:
            statement = statement.where(
                LearningResource.title.contains(search) |
                LearningResource.short_description.contains(search) |
                LearningResource.author.contains(search) |
                LearningResource.platform.contains(search)
            )
        
        if skill:
            # Join with resource_skills and skills tables to filter by skill names
            from app.models.skill import Skill, ResourceSkill
            statement = statement.join(ResourceSkill, ResourceSkill.resource_id == LearningResource.id)
            statement = statement.join(Skill, Skill.id == ResourceSkill.skill_id)
            statement = statement.where(Skill.name.in_(skill))
            statement = statement.distinct()
        
        if level:
            statement = statement.where(LearningResource.level.in_(level))
        
        if resource_type:
            statement = statement.where(LearningResource.resource_type.in_(resource_type))
            
        return statement
    
    # Start with base query
    statement = select(LearningResource)
    statement = _apply_filters(statement)
    
    # Get total count from the filtered query
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()
    
    # Apply pagination to main query
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    
    # Execute query
    resources = session.exec(statement).all()
    
    return list(resources), total


def update(resource: LearningResource, session: Session) -> LearningResource:
    """Update a learning resource."""
    session.add(resource)
    session.commit()
    session.refresh(resource)
    return resource