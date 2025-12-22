from pydantic import BaseModel
from typing import List
from app.schemas.track import TrackRead

class TrackListResponse(BaseModel):
    items: List[TrackRead]
    total: int
    page: int
    page_size: int
    total_pages: int
