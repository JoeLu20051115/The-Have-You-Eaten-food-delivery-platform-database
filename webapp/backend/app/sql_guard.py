from __future__ import annotations

import re

MAX_SQL_CHARS = 12000
MAX_RESULT_ROWS = 120

# Block obvious write / DDL / admin patterns (heuristic, not a full SQL parser).
_FORBIDDEN = re.compile(
    r"\b("
    r"INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|REPLACE|MERGE|"
    r"CALL|EXECUTE|EXEC\b|ROUTINE|PROCEDURE|TRIGGER|EVENT|LOCK\s+TABLES|UNLOCK\s+TABLES|"
    r"HANDLER|PREPARE|DEALLOCATE|DO\b|LOAD\s+DATA|OUTFILE|DUMPFILE|INFILE"
    r")\b",
    re.I | re.DOTALL,
)


def ensure_readonly_select(sql: str) -> str:
    """
    Validate a single SELECT (optionally WITH ... SELECT) and wrap with a hard row cap.
    Raises ValueError if the statement is not allowed.
    """
    s = sql.strip()
    if len(s) > MAX_SQL_CHARS:
        raise ValueError("SQL is too long.")

    # Single statement only (allow one trailing semicolon).
    s = s.rstrip().rstrip(";").strip()
    if ";" in s:
        raise ValueError("Only one SQL statement is allowed.")

    # Comment tricks (conservative block; may reject rare literals containing "--").
    if "--" in s or "/*" in s:
        raise ValueError("Remove SQL comments; they are not allowed in agent queries.")

    if _FORBIDDEN.search(s):
        raise ValueError("This query uses forbidden keywords. Only read-only SELECT is allowed.")

    if not re.match(r"^\s*(WITH|SELECT)\b", s, re.I | re.DOTALL):
        raise ValueError("Only SELECT (or WITH ... SELECT) queries are allowed.")

    if re.search(r"\bINTO\b", s, re.I):
        raise ValueError("INTO clauses are not allowed.")

    # Hard cap rows via subquery wrapper (MySQL/MariaDB).
    return f"SELECT * FROM ({s}) AS _agent_sub LIMIT {MAX_RESULT_ROWS}"
