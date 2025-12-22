
"""Repository for managing track-resource relationships."""

from typing import List, Tuple
from uuid import UUID
from sqlmodel import Session, select, delete
from app.models.track_resource import TrackResource
from app.utils.model_helpers import dbid


def add_resource_to_track(
    session: Session,
    track_id: UUID,
    resource_id: UUID,
    position: int,
    commit: bool = True
) -> TrackResource:
    """Add a resource to a track at a specific position."""
    track_resource = TrackResource(
        track_id=dbid(track_id),
        resource_id=dbid(resource_id),
        position=position
    )
    session.add(track_resource)
    session.flush()

    if commit:
        session.commit()

    return track_resource


def remove_resource_from_track(
    session: Session,
    track_id: UUID,
    resource_id: UUID,
    commit: bool = True
) -> bool:
    """Remove a resource from a track. Returns True if removed."""
    stmt = delete(TrackResource).where(
        TrackResource.track_id == dbid(track_id),
        TrackResource.resource_id == dbid(resource_id)
    )
    result = session.exec(stmt)
    session.flush()

    if commit:
        session.commit()

    return result.rowcount > 0


def get_track_resources(
    session: Session,
    track_id: UUID
) -> List[Tuple[UUID, int]]:
    """Get all resource IDs for a track with their positions."""
    stmt = (
        select(TrackResource.resource_id, TrackResource.position)
        .where(TrackResource.track_id == dbid(track_id))
        .order_by(TrackResource.position)
    )
    results = session.exec(stmt).all()
    # Convert hex strings back to UUID objects
    return [(UUID(resource_id), position) for resource_id, position in results]


def clear_track_resources(
    session: Session,
    track_id: UUID,
    commit: bool = True
) -> int:
    """Remove all resources from a track. Returns count of removed resources."""
    stmt = delete(TrackResource).where(TrackResource.track_id == dbid(track_id))
    result = session.exec(stmt)
    session.flush()

    if commit:
        session.commit()

    return result.rowcount


def get_tracks_for_resource(
    session: Session,
    resource_id: UUID
) -> List[Tuple[UUID, int]]:
    """Get all tracks that contain a resource with their positions."""
    stmt = select(TrackResource.track_id, TrackResource.position).where(
        TrackResource.resource_id == dbid(resource_id)
    )
    results = session.exec(stmt).all()
    # Convert hex strings back to UUID objects
    return [(UUID(track_id), position) for track_id, position in results]
