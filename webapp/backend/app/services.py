from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from math import ceil
from typing import Any

from sqlalchemy import String, and_, func, inspect, or_, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .catalog import TABLE_CATALOG
from .db import get_metadata


class BadRequestError(ValueError):
    pass


class ConflictError(RuntimeError):
    pass


class NotFoundError(LookupError):
    pass


def is_sensitive_column(column_name: str) -> bool:
    normalized = column_name.lower()
    return "password" in normalized or normalized in {"password_hash", "pwd"}


def serialize_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat(sep=" ") if isinstance(value, datetime) else value.isoformat()
    return value


def serialize_row(row: Any) -> dict[str, Any]:
    return {
        key: ("*****" if is_sensitive_column(key) else serialize_value(value))
        for key, value in row.items()
    }


def get_table(table_name: str):
    metadata = get_metadata()
    if table_name not in TABLE_CATALOG:
        raise NotFoundError(f"Table '{table_name}' is not exposed by the web application.")
    try:
        return metadata.tables[table_name]
    except KeyError as exc:
        raise NotFoundError(f"Table '{table_name}' does not exist in the current database.") from exc


def get_table_schema(table_name: str) -> dict[str, Any]:
    table = get_table(table_name)
    config = TABLE_CATALOG[table_name]
    columns = []
    for column in table.columns:
        columns.append(
            {
                "name": column.name,
                "type": str(column.type),
                "nullable": column.nullable,
                "primary_key": column.primary_key,
                "sensitive": is_sensitive_column(column.name),
                "default": str(column.default.arg) if column.default is not None else None,
            }
        )
    return {
        "name": table_name,
        "label": config["label"],
        "primary_keys": config["primary_keys"],
        "searchable_columns": config["searchable_columns"],
        "columns": columns,
    }


def list_tables() -> list[dict[str, Any]]:
    return [get_table_schema(table_name) for table_name in TABLE_CATALOG]


_OPERATOR_MAP = {
    "eq": lambda column, value: column == value,
    "ne": lambda column, value: column != value,
    "lt": lambda column, value: column < value,
    "lte": lambda column, value: column <= value,
    "gt": lambda column, value: column > value,
    "gte": lambda column, value: column >= value,
    "like": lambda column, value: column.ilike(f"%{value}%"),
    "in": lambda column, value: column.in_(value if isinstance(value, list) else [value]),
}


def query_table(db: Session, table_name: str, request: dict[str, Any]) -> dict[str, Any]:
    table = get_table(table_name)
    config = TABLE_CATALOG[table_name]
    page = max(int(request.get("page", 1)), 1)
    page_size = max(min(int(request.get("page_size", 15)), 200), 1)
    search_term = (request.get("search") or "").strip()
    sort_by = request.get("sort_by") or config["default_sort"]
    sort_direction = request.get("sort_direction", "asc")
    filters = request.get("filters") or []

    if sort_by not in table.c:
        sort_by = config["default_sort"]

    query = select(table)
    conditions = []

    if search_term:
        search_conditions = []
        for column_name in config["searchable_columns"]:
            if column_name in table.c:
                search_conditions.append(table.c[column_name].cast(String(255)).ilike(f"%{search_term}%"))
        if search_conditions:
            conditions.append(or_(*search_conditions))

    for item in filters:
        field = item.get("field")
        operator = item.get("operator", "eq")
        value = item.get("value")
        if field not in table.c:
            raise BadRequestError(f"Unknown field '{field}' for table '{table_name}'.")
        if operator not in _OPERATOR_MAP:
            raise BadRequestError(f"Unsupported operator '{operator}'.")
        conditions.append(_OPERATOR_MAP[operator](table.c[field], value))

    if conditions:
        query = query.where(and_(*conditions))

    sort_column = table.c[sort_by]
    query = query.order_by(sort_column.desc() if sort_direction == "desc" else sort_column.asc())

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    query = query.offset((page - 1) * page_size).limit(page_size)
    rows = [serialize_row(row._mapping) for row in db.execute(query)]

    return {
        "table": table_name,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size) if total else 1,
        "rows": rows,
        "schema": get_table_schema(table_name),
    }


def _validate_columns(table, values: dict[str, Any]) -> dict[str, Any]:
    cleaned = {key: value for key, value in values.items() if key in table.c}
    if not cleaned:
        raise BadRequestError("No valid column values were supplied.")
    return cleaned


def create_record(db: Session, table_name: str, values: dict[str, Any]) -> dict[str, Any]:
    table = get_table(table_name)
    cleaned = _validate_columns(table, values)
    try:
        db.execute(table.insert().values(**cleaned))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(str(exc.orig)) from exc
    return {"message": f"Record created in {table_name}."}


def _build_key_condition(table_name: str, keys: dict[str, Any]):
    table = get_table(table_name)
    pk_fields = TABLE_CATALOG[table_name]["primary_keys"]
    missing = [field for field in pk_fields if field not in keys]
    if missing:
        raise BadRequestError(f"Missing primary key fields: {', '.join(missing)}")
    return table, and_(*(table.c[field] == keys[field] for field in pk_fields))


def update_record(db: Session, table_name: str, keys: dict[str, Any], values: dict[str, Any]) -> dict[str, Any]:
    table, condition = _build_key_condition(table_name, keys)
    cleaned = _validate_columns(table, values)
    try:
        result = db.execute(table.update().where(condition).values(**cleaned))
        if result.rowcount == 0:
            db.rollback()
            raise NotFoundError("No matching record was found to update.")
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(str(exc.orig)) from exc
    return {"message": f"Record updated in {table_name}."}


def delete_record(db: Session, table_name: str, keys: dict[str, Any]) -> dict[str, Any]:
    table, condition = _build_key_condition(table_name, keys)
    try:
        result = db.execute(table.delete().where(condition))
        if result.rowcount == 0:
            db.rollback()
            raise NotFoundError("No matching record was found to delete.")
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(str(exc.orig)) from exc
    return {"message": f"Record deleted from {table_name}."}


def dashboard_summary(db: Session) -> dict[str, Any]:
    queries = {
        "customers": "SELECT COUNT(*) FROM customer",
        "orders": "SELECT COUNT(*) FROM orders",
        "stores": "SELECT COUNT(*) FROM store",
        "riders": "SELECT COUNT(*) FROM rider",
        "gmv": "SELECT COALESCE(SUM(total_amount), 0) FROM orders",
        "avg_order_value": "SELECT COALESCE(AVG(total_amount), 0) FROM orders",
        "active_deliveries": "SELECT COUNT(*) FROM delivery_task WHERE task_status IN ('assigned', 'picked_up', 'delivering')",
        "completed_orders": "SELECT COUNT(*) FROM orders WHERE order_status = 'Completed'",
    }
    result = {}
    for key, sql in queries.items():
        result[key] = serialize_value(db.execute(text(sql)).scalar_one())
    return result


def run_sql_rows(db: Session, sql: str) -> list[dict[str, Any]]:
    return [serialize_row(row._mapping) for row in db.execute(text(sql))]


def analytics_bundle(db: Session) -> dict[str, Any]:
    return {
        "order_status": run_sql_rows(
            db,
            "SELECT order_status AS label, COUNT(*) AS value FROM orders GROUP BY order_status ORDER BY value DESC",
        ),
        "delivery_status": run_sql_rows(
            db,
            "SELECT task_status AS label, COUNT(*) AS value FROM delivery_task GROUP BY task_status ORDER BY value DESC",
        ),
        "top_dishes": run_sql_rows(
            db,
            """
            SELECT d.dish_name AS label,
                   ROUND(SUM(od.actual_price), 2) AS revenue,
                   SUM(od.quantity) AS units
            FROM order_detail AS od
            JOIN dish AS d ON d.dish_id = od.dish_id
            GROUP BY d.dish_id, d.dish_name
            ORDER BY units DESC, revenue DESC
            LIMIT 10
            """,
        ),
        "hourly_demand": run_sql_rows(
            db,
            """
            SELECT HOUR(order_time) AS hour_slot,
                   COUNT(*) AS order_count,
                   ROUND(AVG(total_amount), 2) AS avg_ticket
            FROM orders
            GROUP BY HOUR(order_time)
            ORDER BY hour_slot
            """,
        ),
        "rider_performance": run_sql_rows(
            db,
            """
            SELECT r.real_name AS rider_name,
                   COUNT(dt.task_id) AS total_tasks,
                   SUM(dt.task_status = 'completed') AS completed_tasks,
                   ROUND(r.rating, 1) AS rating
            FROM rider AS r
            LEFT JOIN delivery_task AS dt ON dt.rider_id = r.rider_id
            GROUP BY r.rider_id, r.real_name, r.rating
            ORDER BY completed_tasks DESC, rating DESC
            LIMIT 10
            """,
        ),
        "category_revenue": run_sql_rows(
            db,
            """
            SELECT c.category_name AS label,
                   ROUND(SUM(od.actual_price), 2) AS revenue
            FROM order_detail AS od
            JOIN dish AS d ON d.dish_id = od.dish_id
            JOIN category AS c ON c.category_id = d.category_id
            GROUP BY c.category_id, c.category_name
            ORDER BY revenue DESC
            """,
        ),
    }


def database_overview(db: Session) -> dict[str, Any]:
    inspector = inspect(db.bind)
    schemas = inspector.get_schema_names()
    return {
        "current_database": db.execute(text("SELECT DATABASE()")).scalar_one(),
        "schemas": schemas,
        "feature_manual": [
            "Dashboard with business KPIs and charts",
            "No-code query builder with filters, search, sort, and pagination",
            "CRUD management for all exposed tables",
            "Operational analytics for dishes, orders, and riders",
            "Schema explorer powered by live reflected database metadata",
            "LLM assistant (optional) with read-only SQL tool calls against the live database",
            "Deployment-ready FastAPI service and responsive web UI",
            "Role-based login with separate viewer and admin access",
            "Sensitive password fields are masked as ***** in results",
        ],
    }
