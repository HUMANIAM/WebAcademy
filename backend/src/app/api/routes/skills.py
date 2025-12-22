"""Skills API routes."""

from fastapi import APIRouter, Query, Depends
from typing import List
from sqlmodel import Session

from app.repositories import skill_repository
from app.core.db import get_session


router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("/", response_model=List[str])
def search_skills(
    query: str = Query("", description="Search query for skills (empty returns all)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    session: Session = Depends(get_session)
) -> List[str]:
    """
    Search for skills by name with typeahead functionality.
    Empty query returns top skills (alphabetically).
    """
    skills = skill_repository.search_skills(session, query, limit, offset)
    return [s.name for s in skills]
