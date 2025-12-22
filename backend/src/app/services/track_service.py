"""Track service for managing learning tracks."""

from uuid import UUID
from typing import List, Optional, Tuple
from sqlmodel import Session
from fastapi import HTTPException
from app.models.track import LearningTrack
from app.schemas.track import (
    TrackCreate, TrackRead, TrackReadWithResources, TrackNameItem,
    ResourceSummary, TrackResourceItem
)
from app.repositories import track_repository, resource_repository, track_skill_repository, track_resource_repository
from app.services import skill_service, resource_service
from app.utils.validators import validate_difficulty_level
from app.utils.defaults import get_default_track_image_url

def _validate_track_data(data: TrackCreate):
    validate_difficulty_level(data.level)
    if not data.title:
        raise HTTPException(status_code=400, detail="Track title is required")
    if not data.short_description:
        raise HTTPException(status_code=400, detail="Track description is required")
    if not data.skills:
        raise HTTPException(status_code=400, detail="Track must have at least one skill")
    if not data.resources:
        raise HTTPException(status_code=400, detail="Track must have at least one resource")


def _get_track_by_id(track_id: UUID, session: Session) -> LearningTrack:
    """Get a learning track by ID."""
    track = track_repository.get_by_id(track_id, session)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


def _get_track_skills(track_id: UUID, session: Session) -> List[str]:
    """Get the skills for a track."""
    skills = track_skill_repository.list_skills_for_track(session, track_id)
    return [s.name for s in skills]


def _get_track_resources(track_id: UUID, session: Session) -> List[ResourceSummary]:
    """Get resources for a learning track."""
    resource_ids_positions = track_resource_repository.get_track_resources(session, track_id)
    
    # Unpack into separate lists
    resource_ids = [resource_id for resource_id, _ in resource_ids_positions]
    resources = resource_repository.get_by_ids(resource_ids, session)

    # Convert resources to ResourceSummary format
    resources_summary = []
    for resource_id, position in resource_ids_positions:
        resource = resources.get(resource_id)
        if resource:
            resources_summary.append(ResourceSummary(
                id=resource_id,
                title=resource.title,
                short_description=resource.short_description,
                url=resource.url,
                platform=resource.platform,
                type=resource.resource_type,
                level=resource.level,
                estimated_time=resource.estimated_time,
                image_url=resource.image_url,
                position=position
            ))

    return resources_summary


def _construct_read_track(track: LearningTrack, skills: List[str]) -> TrackRead:
    """Construct TrackRead from track model and skills."""
    result = TrackRead.model_validate(track)
    result.skills = skills
    return result


def _add_track_resource(session: Session, track_id: UUID, resource_id: UUID, position: int) -> None:
    """Add a resource to a track at a specific position."""
    track_resource_repository.add_resource_to_track(session, track_id, resource_id, position, commit=False)


def _create_track_resource(resource_data, session: Session) -> UUID:
    """Create a new resource or return existing one if it already exists."""
    try:
        created_resource = resource_service.create_resource(resource_data, session, commit=False)
        return created_resource.id
    except HTTPException as e:
        # If resource already exists (409), use the existing resource
        if e.status_code == 409 and isinstance(e.detail, dict):
            return UUID(str(e.detail.get("existing_resource_id")))
        raise


def _process_track_resources(
    session: Session,
    track_id: UUID,
    resources: List[TrackResourceItem],
    created_by_user_id: str
) -> None:
    """Process track resources - handle both existing and new resources."""
    for item in resources:
        if (item.kind == "existing"):
            # Existing resource - just link it
            resource_id = item.resource_id
            resource = resource_repository.get_by_id(UUID(resource_id), session)
            if not resource:
                raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")
            
            _add_track_resource(session, track_id, resource_id, item.position)
            
        elif (item.kind == "new"):
            # New resource - create it first, then link
            resource_data = item.resource
            resource_data.created_by_user_id = created_by_user_id
            resource_id = _create_track_resource(resource_data, session)
            _add_track_resource(session, track_id, resource_id, item.position)


def create_track(data: TrackCreate, session: Session, created_by_user_id: str = None) -> TrackRead:
    """Create a new learning track with validation."""
    
    _validate_track_data(data)
    
    image_url = get_default_track_image_url(data.image_url)
    
    # Set default user ID if not provided
    user_id = created_by_user_id or "00000000000000000000000000000000"
    
    # Create SQLModel instance
    track = LearningTrack(
        title=data.title,
        short_description=data.short_description,
        level=data.level,
        estimated_time=data.estimated_time,
        image_url=image_url,
        created_by_user_id=user_id,
    )
    
    # Save via repository
    created_track = track_repository.create(track, session, commit=False)
    track_id_uuid = UUID(created_track.id)

    # Handle skills if provided
    if data.skills:
        skill_service.set_track_skills(session, track_id_uuid, data.skills, commit=False)
    
    # Handle resources if provided
    if data.resources:
        _process_track_resources(session, track_id_uuid, data.resources, user_id)
        
    session.commit()
    
    return get_track(track_id_uuid, session)


def get_track(track_id: UUID, session: Session) -> TrackRead:
    """Get a learning track by ID (metadata only)."""
    track = _get_track_by_id(track_id, session)
    skills = _get_track_skills(track_id, session)
    return _construct_read_track(track, skills)

def get_track_with_resources(track_id: UUID, session: Session) -> TrackReadWithResources:
    """Get a learning track with full details including resources."""
    track = get_track(track_id, session)
    resources_summary = _get_track_resources(track_id, session)
    
    result = TrackReadWithResources.model_validate(track)
    result.resources = resources_summary

    return result

def get_tracks(session: Session) -> List[TrackRead]:
    """Get all learning tracks."""
    tracks = track_repository.list_all(session)
    result = []
    for track in tracks:
        skills = _get_track_skills(UUID(track.id), session)
        track_read = TrackRead.model_validate(track)
        track_read.skills = skills
        result.append(track_read)
    return result


def list_tracks(
    session: Session,
    search: Optional[str] = None,
    skill: Optional[List[str]] = None,
    level: Optional[List[str]] = None,
    page: int = 1,
    page_size: int = 12
) -> Tuple[List[TrackRead], int]:
    """List learning tracks with filtering and pagination."""
    tracks, total = track_repository.list_filtered(
        session=session,
        search=search,
        skill=skill,
        level=level,
        page=page,
        page_size=page_size
    )
    
    result = []
    for track in tracks:
        skills = _get_track_skills(UUID(track.id), session)
        track_read = TrackRead.model_validate(track)
        track_read.skills = skills
        result.append(track_read)
    
    return result, total


def get_tracks_names(session: Session) -> List[TrackNameItem]:
    """Get all tracks with just id and title (for dropdowns/autocomplete)."""
    return track_repository.list_tracks_names(session)
