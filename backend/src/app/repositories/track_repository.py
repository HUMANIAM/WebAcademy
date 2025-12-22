"""Track repository for database operations on learning tracks."""

from uuid import UUID
from typing import List, Optional, Tuple, Dict
from sqlmodel import Session, select, func
from app.models.track import LearningTrack
from app.models.skill import Skill, TrackSkill
from app.utils.model_helpers import dbid
from app.repositories import resource_repository, resource_skill_repository, track_skill_repository, track_resource_repository
from app.schemas.track import TrackNameItem

def create(track: LearningTrack, session: Session, commit: bool = True) -> LearningTrack:
    """Create a new learning track."""
    session.add(track)
    if commit:
        session.commit()
        session.refresh(track)
    return track


def get_by_id(track_id: UUID, session: Session) -> Optional[LearningTrack]:
    """Get a learning track by ID (metadata only)."""
    return session.get(LearningTrack, dbid(track_id))


def get_by_id_with_details(track_id: UUID, session: Session) -> Optional[Dict]:
    """Get a learning track with full details: metadata, skills, and resources with their skills.
    
    Returns a dict with:
    - track: LearningTrack model
    - skills: List of skill names for the track
    - resources: List of resources with their skills, ordered by position
    """
    track = session.get(LearningTrack, dbid(track_id))
    if not track:
        return None
    
    # Get track skills using track_skill_repository
    track_skills_list = track_skill_repository.list_skills_for_track(session, track_id)
    track_skills = [skill.name for skill in track_skills_list]
    
    # Get track resources using track_resource_repository
    resource_ids_positions = track_resource_repository.get_track_resources(session, track_id)
    
    # Unpack into separate lists
    resource_ids = [resource_id for resource_id, _ in resource_ids_positions]
    
    # Get full resource objects
    resources_map = resource_repository.get_by_ids(resource_ids, session)
    
    # Get skills for all resources using resource_skill_repository
    resource_skills_map = resource_skill_repository.list_skills_for_resources(session, resource_ids)
    
    # Build resources list with skills
    resources_with_skills = []
    for resource_id, position in resource_ids_positions:
        resource = resources_map.get(resource_id)
        if resource:
            resources_with_skills.append({
                "resource": resource,
                "position": position,
                "skills": resource_skills_map.get(resource_id, [])
            })
    
    return {
        "track": track,
        "skills": track_skills,
        "resources": resources_with_skills
    }


def list_all(session: Session) -> List[LearningTrack]:
    """List all learning tracks."""
    statement = select(LearningTrack)
    results = session.exec(statement)
    return list(results.all())


def list_tracks_names(session: Session) -> List[TrackNameItem]:
    """List all tracks with just id and title (for dropdowns/autocomplete)."""
    statement = select(LearningTrack.id, LearningTrack.title).order_by(LearningTrack.title)
    results = session.exec(statement)
    return [TrackNameItem(id=UUID(track_id), title=title) for track_id, title in results.all()]


def update(track: LearningTrack, session: Session) -> LearningTrack:
    """Update a learning track."""
    session.add(track)
    session.commit()
    session.refresh(track)
    return track


def list_filtered(
    session: Session,
    search: Optional[str] = None,
    skill: Optional[List[str]] = None,
    level: Optional[List[str]] = None,
    page: int = 1,
    page_size: int = 12
) -> Tuple[List[LearningTrack], int]:
    """List learning tracks with filtering and pagination.
    
    Args:
        session: Database session
        search: Search in title, short_description, created_by_user_id
        skill: Filter by skill names (via track_skills junction)
        level: Filter by difficulty level
        page: Page number (1-indexed)
        page_size: Number of items per page
    
    Returns:
        Tuple of (tracks list, total count)
    """
    
    def _apply_filters(statement):
        """Apply all filters to a statement."""
        nonlocal search, skill, level
        
        if search:
            statement = statement.where(
                LearningTrack.title.contains(search) |
                LearningTrack.short_description.contains(search) |
                LearningTrack.created_by_user_id.contains(search) |
                LearningTrack.level.contains(search)
            )
        
        if skill:
            statement = statement.join(TrackSkill, TrackSkill.track_id == LearningTrack.id)
            statement = statement.join(Skill, Skill.id == TrackSkill.skill_id)
            statement = statement.where(Skill.name.in_(skill))
            statement = statement.distinct()
        
        if level:
            statement = statement.where(LearningTrack.level.in_(level))
            
        return statement
    
    # Start with base query
    statement = select(LearningTrack)
    statement = _apply_filters(statement)
    
    # Get total count from the filtered query
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()
    
    # Apply pagination to main query
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    
    # Execute query
    tracks = session.exec(statement).all()
    
    return list(tracks), total
