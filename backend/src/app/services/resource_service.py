from uuid import UUID
from typing import List, Optional, Tuple
from sqlmodel import Session
from fastapi import HTTPException
from app.models.resource import LearningResource
from app.schemas.resource import ResourceCreate, ResourceRead, ResourceUpdate, ResourceLookupResponse
from app.repositories import resource_repository, resource_skill_repository
from app.services.skill_service import set_resource_skills
from app.utils.normalizers import normalize_url
from app.utils import validators
from app.utils.defaults import get_default_resource_image_url

def _normalize_and_validate_url(raw_url: str) -> str:
    raw_url = (raw_url or "").strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="URL is required")

    normalized = normalize_url(raw_url)
    if not normalized:
        raise HTTPException(status_code=400, detail="Invalid URL")

    validators.validate_url(normalized)
    return normalized


def _get_resource_skills(resource_id: UUID, session: Session) -> List[str]:
    """Get the skills for a resource."""
    skills = resource_skill_repository.list_skills_for_resource(session, resource_id)
    return [s.name for s in skills]


def _get_resource_by_id(resource_id: UUID, session: Session) -> LearningResource:
    """Get a learning resource by ID."""
    resource = resource_repository.get_by_id(resource_id, session)

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    return resource

def _check_resource_not_exist(normalized_url: str, session: Session):
    """Get a learning resource by normalized URL."""
    resource = resource_repository.get_by_normalized_url(normalized_url, session)

    if resource:
        raise HTTPException(
            status_code=409,
            detail={"error": "resource_already_exists", "existing_resource_id": resource.id},
        )
    
    return resource

def _construct_read_resource(resource: LearningResource, skills: List[str]) -> ResourceRead:
    result = ResourceRead.model_validate(resource)
    result.skills = skills

    return result


def lookup_resource_by_url(url: str, session: Session) -> ResourceLookupResponse:
    """Lookup a resource by URL to check for duplicates."""
    normalized_url = _normalize_and_validate_url(url)
    resource = resource_repository.get_by_normalized_url(normalized_url, session)
    
    if not resource:
        return ResourceLookupResponse(exists=False, normalized_url=normalized_url, resource=None)
    
    # Get skills for the resource
    skills = _get_resource_skills(UUID(resource.id), session)
    resource_read = _construct_read_resource(resource, skills)
    
    return ResourceLookupResponse(
        exists=True,
        normalized_url=normalized_url,
        resource=resource_read,
    )


def create_resource(data: ResourceCreate, session: Session, commit: bool = True) -> ResourceRead:
    """Create a new learning resource with validation."""
    # Normalize and validate URL
    normalized_url = _normalize_and_validate_url(data.url)
    _check_resource_not_exist(normalized_url, session)
    
    # Validate platform
    validators.validate_platform(data.platform)
    
    # Validate resource type
    validators.validate_resource_type(data.resource_type)

    # Validate difficulty level
    validators.validate_difficulty_level(data.level)
    
    # Validate funding type
    validators.validate_funding_type(data.default_funding_type)
    
    # Set default image if not provided or empty
    image_url = get_default_resource_image_url(data.image_url)
    
    # Create SQLModel instance
    resource = LearningResource(
        title=data.title,
        short_description=data.short_description,
        url=data.url,
        normalized_url=normalized_url,
        platform=data.platform,
        resource_type=data.resource_type,
        level=data.level,
        estimated_time=data.estimated_time,
        author=data.author,
        image_url=image_url,
        default_funding_type=data.default_funding_type,
        created_by_user_id=data.created_by_user_id or "00000000000000000000000000000000",
    )
    
    # Save to database
    created_resource = resource_repository.create(resource, session, commit=False)
    
    # Set skills if provided
    if data.skills:
        set_resource_skills(session, UUID(created_resource.id), data.skills, commit=False)
    
    # Commit if requested
    if commit:
        session.commit()
    
    # Get skills for response
    skills = _get_resource_skills(UUID(created_resource.id), session)
    
    return _construct_read_resource(created_resource, skills)


def get_resource(resource_id: UUID, session: Session) -> ResourceRead:
    """Get a learning resource by ID."""

    resource = _get_resource_by_id(resource_id, session)
    return _construct_read_resource(resource, _get_resource_skills(UUID(resource.id), session))


def list_resources(
    session: Session,
    search: Optional[str] = None,
    skill: Optional[List[str]] = None,
    level: Optional[List[str]] = None,
    resource_type: Optional[List[str]] = None,
    page: int = 1,
    page_size: int = 12
) -> Tuple[List[ResourceRead], int]:

    """List learning resources with filtering and pagination."""
    # Get filtered resources from repository
    resources, total = resource_repository.list_filtered(
        session=session,
        search=search,
        skill=skill,
        level=level,
        resource_type=resource_type,
        page=page,
        page_size=page_size
    )
    
    # Get skills for each resource and construct response
    result = []
    for r in resources:
        try:
            skills = _get_resource_skills(UUID(r.id), session)
            result.append(_construct_read_resource(r, skills))
        except Exception as e:
            # If skills fail, return resource without skills
            result.append(_construct_read_resource(r, []))
    
    return result, total


def update_resource(resource_id: UUID, data: ResourceUpdate, session: Session) -> ResourceRead:
    """Update a learning resource."""
    # Get existing resource
    resource = _get_resource_by_id(resource_id, session)
    
    # Update only provided fields
    update_data = data.model_dump(exclude_unset=True)
    
    if "url" in update_data:
        _validate_url(update_data["url"])
    
    if "platform" in update_data:
        validators.validate_platform(update_data["platform"])
    
    if "resource_type" in update_data:
        validators.validate_resource_type(update_data["resource_type"])

    if "level" in update_data:
        validators.validate_difficulty_level(update_data["level"])
    
    if "default_funding_type" in update_data:
        validators.validate_funding_type(update_data["default_funding_type"])

    # Handle skills update if provided
    if "skills" in update_data:
        skill_service.set_resource_skills(session, resource_id, update_data["skills"])
        # Remove skills from update_data to avoid setting on resource model
        del update_data["skills"]

    # Apply updates
    for key, value in update_data.items():
        setattr(resource, key, value)
    
    # Save via repository
    updated_resource = resource_repository.update(resource, session)
    
    # Return as ResourceRead with skills populated
    return get_resource(resource_id, session)
