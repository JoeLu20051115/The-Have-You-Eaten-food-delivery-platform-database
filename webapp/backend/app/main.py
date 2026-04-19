from __future__ import annotations

from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .auth import (
    authenticate_user,
    clear_auth_cookie,
    get_optional_user,
    register_user,
    require_roles,
    set_auth_cookie,
)
from .config import settings
from .db import get_db
from .schemas import LoginRequest, MutationRequest, QueryRequest, RegisterRequest
from .services import (
    BadRequestError,
    ConflictError,
    NotFoundError,
    analytics_bundle,
    create_record,
    dashboard_summary,
    database_overview,
    delete_record,
    list_tables,
    query_table,
    update_record,
)

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def root() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        current = database_overview(db)["current_database"]
        return {"status": "ok", "database": current}
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/auth/login")
def auth_login(response: Response, payload: LoginRequest) -> dict:
    user = authenticate_user(payload.username, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    set_auth_cookie(response, user)
    return {
        "authenticated": True,
        "username": user.username,
        "role": user.role,
        "customer_id": user.customer_id,
        "permissions": user.permissions,
    }


@app.post("/api/auth/register")
def auth_register(response: Response, payload: RegisterRequest) -> dict:
    user = register_user(payload.username, payload.phone, payload.password)
    clear_auth_cookie(response)
    return {
        "authenticated": False,
        "username": user.username,
        "role": user.role,
        "customer_id": user.customer_id,
        "permissions": user.permissions,
        "message": "Registration successful",
    }


@app.get("/api/auth/me")
def auth_me(request: Request) -> dict:
    user = get_optional_user(request)
    if user is None:
        return {"authenticated": False}
    return {
        "authenticated": True,
        "username": user.username,
        "role": user.role,
        "customer_id": user.customer_id,
        "permissions": user.permissions,
    }


@app.post("/api/auth/logout")
def auth_logout(response: Response) -> dict[str, str]:
    clear_auth_cookie(response)
    return {"message": "Logged out"}


@app.get("/api/meta/tables")
def api_tables(_: dict = Depends(require_roles("user", "admin"))) -> list[dict]:
    return list_tables()


@app.get("/api/meta/overview")
def api_overview(db: Session = Depends(get_db), _: dict = Depends(require_roles("user", "admin"))) -> dict:
    return database_overview(db)


@app.get("/api/dashboard/summary")
def api_dashboard_summary(db: Session = Depends(get_db), _: dict = Depends(require_roles("user", "admin"))) -> dict:
    return dashboard_summary(db)


@app.get("/api/dashboard/analytics")
def api_dashboard_analytics(db: Session = Depends(get_db), _: dict = Depends(require_roles("user", "admin"))) -> dict:
    return analytics_bundle(db)


@app.post("/api/query/{table_name}")
def api_query_table(
    table_name: str,
    request: QueryRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("user", "admin")),
) -> dict:
    try:
        return query_table(db, table_name, request.model_dump())
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except BadRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/admin/{table_name}/create")
def api_create_record(
    table_name: str,
    request: MutationRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin")),
) -> dict:
    try:
        return create_record(db, table_name, request.values)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except BadRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/admin/{table_name}/update")
def api_update_record(
    table_name: str,
    request: MutationRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin")),
) -> dict:
    try:
        return update_record(db, table_name, request.keys, request.values)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except BadRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/admin/{table_name}/delete")
def api_delete_record(
    table_name: str,
    request: MutationRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin")),
) -> dict:
    try:
        return delete_record(db, table_name, request.keys)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except BadRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
