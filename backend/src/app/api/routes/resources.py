from fastapi import APIRouter, Depends, status, Query
from sqlmodel import Session
from uuid import UUID
from typing import List, Optional
from app.core.db import get_session
from app.schemas.resource import ResourceCreate, ResourceRead, ResourceUpdate, ResourceLookupResponse
from app.schemas.resource_list import ResourceListResponse
from app.services import resource_service

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.post(
    "/",
    response_model=ResourceRead,
    status_code=status.HTTP_201_CREATED
)
def create_resource(
    data: ResourceCreate,
    session: Session = Depends(get_session)
):
    """Create a new learning resource."""
    resource = resource_service.create_resource(data, session)
    
    return resource


@router.get(
    "/",
    response_model=ResourceListResponse,
    status_code=status.HTTP_200_OK
)
def list_resources(
    session: Session = Depends(get_session),
    search: Optional[str] = Query(None),
    skill: Optional[List[str]] = Query(None),
    level: Optional[List[str]] = Query(None),
    resource_type: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    """List learning resources with filtering and pagination."""
    # Get filtered and paginated resources with total count
    resources, total = resource_service.list_resources(
        session=session,
        search=search,
        skill=skill,
        level=level,
        resource_type=resource_type,
        page=page,
        page_size=page_size
    )
    
    return ResourceListResponse(
        items=resources,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get(
    "/lookup",
    response_model=ResourceLookupResponse,
    status_code=status.HTTP_200_OK
)
def lookup_resource(
    url: str = Query(..., description="URL to lookup for duplicate resources"),
    session: Session = Depends(get_session)
):
    """Lookup a resource by URL to check for duplicates."""
    return resource_service.lookup_resource_by_url(url, session)


@router.get(
    "/{resource_id}",
    response_model=ResourceRead,
    status_code=status.HTTP_200_OK
)
def get_resource(
    resource_id: UUID,
    session: Session = Depends(get_session)
):
    """Get a learning resource by ID."""
    resource = resource_service.get_resource(resource_id, session)
    
    return resource


@router.patch(
    "/{resource_id}",
    response_model=ResourceRead,
    status_code=status.HTTP_200_OK
)
def update_resource(
    resource_id: UUID,
    data: ResourceUpdate,
    session: Session = Depends(get_session)
):
    """Update a learning resource."""
    resource = resource_service.update_resource(resource_id, data, session)
    
    return resource