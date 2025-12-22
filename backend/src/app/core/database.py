"""Database utilities and configuration."""

import os
from pathlib import Path


def get_database_path() -> str:
    """
    Get the path to the SQLite database file.
    
    Returns the absolute path to xlp.db in the backend/src directory.
    """
    # Get the directory where this file is located (app/core/)
    current_dir = Path(__file__).parent
    # Go up to src/ directory and then to xlp.db
    db_path = current_dir.parent.parent / "xlp.db"
    return str(db_path.absolute())
