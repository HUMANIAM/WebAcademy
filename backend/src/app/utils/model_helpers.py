import uuid
from typing import List, Dict, Tuple, Any, Union
from sqlalchemy import text
from sqlmodel import Session

def dbid(x: Union[uuid.UUID, str]) -> str:
    if isinstance(x, uuid.UUID):
        return x.hex
    return x

def generate_id() -> str:
    return uuid.uuid4().hex  # 32-char hex


def bind_in_clause(prefix: str, values: List[Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Build placeholders and bind_dict for an IN clause.
    
    Example:
        placeholders, params = bind_in_clause("n", ["a", "b", "c"])
        # placeholders = ":n0,:n1,:n2"
        # params = {"n0": "a", "n1": "b", "n2": "c"}
        stmt = text(f"SELECT * FROM t WHERE name IN ({placeholders})").bindparams(**params)
    """
    placeholders = ",".join([f":{prefix}{i}" for i in range(len(values))])
    params = {f"{prefix}{i}": v for i, v in enumerate(values)}
    return placeholders, params


def bind_values_clause(columns: List[str], rows: List[Dict[str, Any]]) -> Tuple[str, Dict[str, Any]]:
    """
    Build VALUES clause and bind_dict for batch INSERT.
    
    Example:
        values_clause, params = bind_values_clause(["id", "name"], [
            {"id": "abc", "name": "Python"},
            {"id": "def", "name": "Java"},
        ])
        # values_clause = "(:id0, :name0), (:id1, :name1)"
        # params = {"id0": "abc", "name0": "Python", "id1": "def", "name1": "Java"}
        stmt = text(f"INSERT INTO t (id, name) VALUES {values_clause}").bindparams(**params)
    """
    values_parts = []
    params = {}
    for i, row in enumerate(rows):
        col_placeholders = ", ".join([f":{col}{i}" for col in columns])
        values_parts.append(f"({col_placeholders})")
        for col in columns:
            params[f"{col}{i}"] = row[col]
    return ", ".join(values_parts), params


def exec_sql(session: Session, sql: str, **params: Any) -> Any:
    """
    Execute a raw SQL statement with bound parameters.
    
    Example:
        rows = exec_sql(session, "SELECT * FROM t WHERE id = :id", id="abc").all()
    """
    stmt = text(sql).bindparams(**params) if params else text(sql)
    return session.exec(stmt)