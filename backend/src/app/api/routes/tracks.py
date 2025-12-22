from fastapi import APIRouter, Depends, status, Query
from sqlmodel import Session
from uuid import UUID
from typing import List, Optional
from app.core.db import get_session
from app.schemas.track import TrackCreate, TrackRead, TrackReadWithResources, TrackUpdate, TrackNameItem
from app.schemas.track_list import TrackListResponse
from app.services import track_service

router = APIRouter(prefix="/api/tracks", tags=["tracks"])


@router.post(
    "/",
    response_model=TrackRead,
    status_code=status.HTTP_201_CREATED
)
def create_track(
    data: TrackCreate,
    session: Session = Depends(get_session)
):
    """Create a new learning track."""
    track = track_service.create_track(data, session)
    
    return track


@router.get(
    "/",
    response_model=TrackListResponse,
    status_code=status.HTTP_200_OK
)
def list_tracks(
    session: Session = Depends(get_session),
    search: Optional[str] = Query(None),
    skill: Optional[List[str]] = Query(None),
    level: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    """List learning tracks with filtering and pagination."""
    tracks, total = track_service.list_tracks(
        session=session,
        search=search,
        skill=skill,
        level=level,
        page=page,
        page_size=page_size
    )
    
    return TrackListResponse(
        items=tracks,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )


@router.get(
    "/names",
    response_model=List[TrackNameItem],
    status_code=status.HTTP_200_OK
)
def list_track_names(
    session: Session = Depends(get_session)
):
    """Get all tracks with just id and title (for dropdowns/autocomplete)."""
    track_names = track_service.get_tracks_names(session)
    
    return track_names

@router.get(
    "/{track_id}",
    response_model=TrackRead,
    status_code=status.HTTP_200_OK
)
def get_track(
    track_id: UUID,
    session: Session = Depends(get_session)
):
    """Get a learning track by ID."""
    track = track_service.get_track(track_id, session)
    
    return track


@router.get(
    "/{track_id}/details",
    response_model=TrackReadWithResources,
    status_code=status.HTTP_200_OK
)
def get_track_with_resources(
    track_id: UUID,
    session: Session = Depends(get_session)
):
    """Get a learning track with full details including resources."""
    track = track_service.get_track_with_resources(track_id, session)
    
    return track


@router.patch(
    "/{track_id}",
    response_model=TrackRead,
    status_code=status.HTTP_200_OK
)
def update_track(
    track_id: UUID,
    data: TrackUpdate,
    session: Session = Depends(get_session)
):
    """Update a learning track."""
    # Note: update_track service function needs to be implemented
    # track = track_service.update_track(track_id, data, session)
    # return track
    
    # Placeholder - return existing track for now
    track = track_service.get_track(track_id, session)
    return track