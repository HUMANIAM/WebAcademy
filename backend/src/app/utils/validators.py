from fastapi import HTTPException
from pydantic import HttpUrl, ValidationError

def validate_url(url: str) -> None:
    """Validate that the URL is valid (canonical form)."""
    try:
        HttpUrl(url)
    except ValidationError:
        raise HTTPException(status_code=400, detail="Invalid URL format")


def validate_item_in_set(item_type: str, item: str, items_set: set()) -> None:
    """Validate item is in set."""
    if item not in items_set:
        raise HTTPException(
            status_code=400,
            detail=f"{item} is invalid {item_type}. Must be one of: {', '.join(items_set)}"
        )

def validate_difficulty_level(level: str) -> None:
    """Validate difficulty level."""
    VALID_DIFFICULTY_LEVELS = {"Beginner", "Intermediate", "Advanced"}
    validate_item_in_set("difficulty level", level, VALID_DIFFICULTY_LEVELS)


def validate_platform(platform: str) -> None:
    """Validate platform."""
    VALID_PLATFORMS = {"Udemy", "Coursera", "Other"}
    validate_item_in_set("platform", platform, VALID_PLATFORMS)


def validate_resource_type(resource_type: str) -> None:
    """Validate resource type."""
    VALID_RESOURCE_TYPES = {"Course", "Project", "Book", "Article & Blog", "Video & Talk"}
    validate_item_in_set("resource_type", resource_type, VALID_RESOURCE_TYPES)


def validate_funding_type(funding_type: str) -> None:
    """Validate funding type."""
    VALID_FUNDING_TYPES = {"gift_code", "reimbursement", "virtual_card", "org_subscription"}
    validate_item_in_set("funding_type", funding_type, VALID_FUNDING_TYPES)
