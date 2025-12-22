from typing import List
from sqlmodel import Session
from app.models.skill import Skill
from app.utils.model_helpers import generate_id, bind_in_clause, bind_values_clause, exec_sql


def search_skills(session: Session, query: str, limit: int = 20, offset: int = 0) -> List[Skill]:
    """
    Search for skills by name with typeahead functionality.
    
    If query is empty, returns skills alphabetically.
    If query is provided, returns matching skills ordered by relevance:
    1. Exact matches first
    2. Prefix matches
    3. Contains matches
    4. Then by length (shorter names first)
    5. Then alphabetically
    """
    q = (query or "").strip()
    
    if not q:
        # Empty query - return all skills alphabetically with pagination
        rows = exec_sql(session, """
            SELECT id, name, created_at
            FROM skills
            ORDER BY name
            LIMIT :limit OFFSET :offset
        """, limit=limit, offset=offset).all()
    else:
        # Search with relevance ordering
        rows = exec_sql(session, """
            SELECT id, name, created_at
            FROM skills
            WHERE name LIKE :contains
            ORDER BY
                CASE
                    WHEN lower(name) = lower(:q) THEN 0
                    WHEN lower(name) LIKE lower(:prefix) THEN 1
                    ELSE 2
                END,
                length(name),
                name
            LIMIT :limit OFFSET :offset
        """, q=q, prefix=f"{q}%", contains=f"%{q}%", limit=limit, offset=offset).all()

    return [Skill(id=r[0], name=r[1], created_at=r[2]) for r in rows]


def upsert_skills_by_names(session: Session, names: List[str]) -> List[str]:
    """
    Ensure skills exist for each name and return their ids.
    NOTE: Uses SQLite INSERT OR IGNORE to avoid N+1 ORM lookups and handle conflicts safely.
    """
    if not names:
        return []

    # Batch insert with single statement
    rows_data = [{"id": generate_id(), "name": n} for n in names]
    values_clause, insert_params = bind_values_clause(["id", "name"], rows_data)
    exec_sql(session, f"INSERT OR IGNORE INTO skills (id, name) VALUES {values_clause}", **insert_params)

    # Fetch ids in one query
    placeholders, select_params = bind_in_clause("n", names)
    rows = exec_sql(session, f"SELECT id, name FROM skills WHERE name IN ({placeholders})", **select_params).all()

    id_by_name = {r[1]: r[0] for r in rows}
    return [id_by_name[n] for n in names if n in id_by_name]