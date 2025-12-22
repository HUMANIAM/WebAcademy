"""Default values and utility functions for the application."""

# Default image URLs
DEFAULT_RESOURCE_IMAGE_URL = "https://placehold.co/600x400?text=Learning+Resource"
DEFAULT_TRACK_IMAGE_URL = "https://placehold.co/600x400?text=Learning+Track"


def get_default_image_url(image_url: str, default_url: str) -> str:
    """Get image URL with fallback to default if empty or None."""
    if not image_url or image_url.strip() == "":
        return default_url
    return image_url


def get_default_resource_image_url(image_url: str) -> str:
    """Get resource image URL with fallback to default."""
    return get_default_image_url(image_url, DEFAULT_RESOURCE_IMAGE_URL)


def get_default_track_image_url(image_url: str) -> str:
    """Get track image URL with fallback to default."""
    return get_default_image_url(image_url, DEFAULT_TRACK_IMAGE_URL)
