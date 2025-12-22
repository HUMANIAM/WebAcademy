from pydantic import BaseModel
from typing import List
from app.schemas.resource import ResourceRead

class ResourceListResponse(BaseModel):
    items: List[ResourceRead]
    total: int
    page: int
    page_size: int
    total_pages: int
