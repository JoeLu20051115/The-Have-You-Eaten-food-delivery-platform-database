from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class FilterCondition(BaseModel):
    field: str
    operator: Literal["eq", "ne", "lt", "lte", "gt", "gte", "like", "in"] = "eq"
    value: Any


class QueryRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=15, ge=1, le=200)
    search: str | None = None
    sort_by: str | None = None
    sort_direction: Literal["asc", "desc"] = "asc"
    filters: list[FilterCondition] = Field(default_factory=list)


class MutationRequest(BaseModel):
    keys: dict[str, Any] = Field(default_factory=dict)
    values: dict[str, Any] = Field(default_factory=dict)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=200)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=11, max_length=20)
    password: str = Field(min_length=1, max_length=200)


class AgentHistoryTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(default="", max_length=32000)


class AgentChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    history: list[AgentHistoryTurn] = Field(default_factory=list, max_length=24)
