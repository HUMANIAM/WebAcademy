from sqlmodel import SQLModel, Session, create_engine
from app.core.config import get_settings
# Import models to ensure they are registered with SQLModel
from app.models.resource import LearningResource  # noqa: F401
from app.models.track import LearningTrack  # noqa: F401
from app.models.track_resource import TrackResource  # noqa: F401

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=True  # Log SQL queries
)


def create_db_and_tables():
    """Create all tables in the database."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency to get DB session."""
    with Session(engine) as session:
        yield session