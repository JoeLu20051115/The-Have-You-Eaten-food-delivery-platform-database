from __future__ import annotations

import json
import time
from typing import Any

from openai import OpenAI
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .config import settings
from .services import list_tables, serialize_row
from .sql_guard import MAX_RESULT_ROWS, ensure_readonly_select


def _schema_digest() -> str:
    lines: list[str] = []
    for table in list_tables():
        col_names = [c["name"] for c in table["columns"]]
        lines.append(f"Table `{table['name']}` ({table['label']}): " + ", ".join(f"`{n}`" for n in col_names))
    return "\n".join(lines)


SYSTEM_PROMPT = """You are the SmartEats database assistant for a food delivery platform (MySQL/MariaDB).
You help signed-in users explore business data with accurate, concise answers.

Rules:
- Use the tool `run_readonly_query` to run a single SELECT (or WITH ... SELECT) when you need data.
- Never guess numbers: if the user asks for counts, sums, or lists, call the tool.
- Prefer short SQL, correct joins, and clear column aliases.
- If a query fails, read the error, fix the SQL, and try again (at most two attempts per user turn).
- Respond in the same language the user uses (Chinese or English).
- Do not reveal or guess passwords; password-like fields are masked server-side.
"""


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "run_readonly_query",
            "description": (
                "Execute one read-only SQL SELECT against the smarteats database. "
                "Returns up to "
                + str(MAX_RESULT_ROWS)
                + " rows as JSON (values may be truncated). Use standard MySQL syntax."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "sql": {
                        "type": "string",
                        "description": "A single SELECT or WITH ... SELECT statement.",
                    }
                },
                "required": ["sql"],
            },
        },
    }
]


def _run_tool(db: Session, name: str, arguments_json: str) -> dict[str, Any]:
    if name != "run_readonly_query":
        return {"ok": False, "error": f"Unknown tool {name}"}
    try:
        args = json.loads(arguments_json or "{}")
    except json.JSONDecodeError as exc:
        return {"ok": False, "error": f"Invalid tool arguments: {exc}"}
    sql = (args.get("sql") or "").strip()
    if not sql:
        return {"ok": False, "error": "Missing sql parameter."}
    try:
        safe_sql = ensure_readonly_select(sql)
    except ValueError as exc:
        return {"ok": False, "error": str(exc)}
    try:
        result = db.execute(text(safe_sql))
        rows = [serialize_row(row._mapping) for row in result]
        return {
            "ok": True,
            "row_count": len(rows),
            "rows": rows,
            "note": f"At most {MAX_RESULT_ROWS} rows returned.",
        }
    except SQLAlchemyError as exc:
        return {"ok": False, "error": str(exc)}


JSON_MODE_SUFFIX = """

Reply with ONLY a single JSON object (no markdown fences, no other text). Format:
{"answer": "natural language reply for the user", "sql": "one SELECT or WITH ... SELECT statement, or null if no database query is needed"}

Rules:
- "sql" must be read-only: one SELECT (or WITH ... SELECT). Use null for greetings or questions answerable without data.
- Prefer short SQL with clear aliases.
"""

# ModelScope / some OpenAI-compatible backends intermittently return HTTP 200 with empty choices;
# a short user+assistant primer avoids relying on a lone `system` message (better GLM compatibility).
JSON_MODE_ASSISTANT_ACK = "Understood. I will reply with a single JSON object only, with no other text."


def _completion_has_usable_message(response: Any) -> bool:
    choices = getattr(response, "choices", None) or []
    if not choices:
        return False
    msg = choices[0].message
    if msg is None:
        return False
    if getattr(msg, "tool_calls", None):
        return True
    if (msg.content or "").strip():
        return True
    return False


def _chat_completions_create(client: OpenAI, *, max_attempts: int = 4, base_delay_s: float = 0.75, **kwargs: Any) -> Any:
    """Call chat.completions.create; retry when the server returns an empty shell (no choices / empty message)."""
    last: Any = None
    for attempt in range(max_attempts):
        last = client.chat.completions.create(**kwargs)
        if _completion_has_usable_message(last):
            return last
        if attempt < max_attempts - 1:
            time.sleep(base_delay_s * (2**attempt))
    return last


def _parse_json_reply(raw: str) -> dict[str, Any]:
    text = (raw or "").strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return json.loads(text)


def _run_agent_json_mode(
    db: Session,
    client: OpenAI,
    user_message: str,
    history: list[dict[str, str]],
) -> dict[str, Any]:
    """Fallback when the API does not return OpenAI-compatible tool calls (e.g. some ModelScope models)."""
    schema_block = _schema_digest()
    intro = (
        "You are the SmartEats database assistant (MySQL/MariaDB). The user asks in Chinese or English.\n\n"
        "Exposed schema:\n"
        + schema_block
        + JSON_MODE_SUFFIX
    )
    messages: list[dict[str, Any]] = [
        {"role": "user", "content": intro},
        {"role": "assistant", "content": JSON_MODE_ASSISTANT_ACK},
    ]
    for turn in history:
        r = turn.get("role")
        c = turn.get("content", "")
        if r in ("user", "assistant") and isinstance(c, str):
            messages.append({"role": r, "content": c})
    messages.append({"role": "user", "content": user_message})

    response = _chat_completions_create(
        client,
        model=settings.llm_model,
        messages=messages,
        temperature=0.2,
    )
    choices = getattr(response, "choices", None) or []
    if not choices:
        raise RuntimeError(
            "The LLM repeatedly returned an empty response (no choices). This is often a temporary ModelScope "
            "quota, rate limit, or network issue—try again shortly. If it persists, verify SMARTEATS_LLM_MODEL "
            "matches an id from your provider's model list."
        )

    content = choices[0].message.content
    if content is None:
        raise RuntimeError("LLM returned empty message content.")

    try:
        data = _parse_json_reply(content)
    except (json.JSONDecodeError, ValueError) as exc:
        return {
            "reply": f"Could not parse JSON from the model. Raw reply:\n{content[:2000]}",
            "steps": [{"tool": "json_parse", "ok": False, "sql_preview": str(exc)[:200]}],
            "model": settings.llm_model,
        }

    answer = str(data.get("answer") or "").strip()
    sql = data.get("sql")
    steps: list[dict[str, Any]] = []

    if sql is not None and str(sql).strip():
        payload = _run_tool(db, "run_readonly_query", json.dumps({"sql": str(sql).strip()}))
        sql_preview = str(sql).strip()[:500]
        steps.append({"tool": "run_readonly_query", "ok": payload.get("ok"), "sql_preview": sql_preview})
        if payload.get("ok"):
            rows = payload.get("rows") or []
            preview = json.dumps(rows[:25], ensure_ascii=False, default=str)
            answer = (
                answer
                + "\n\n---\nQuery result (up to 25 rows preview):\n"
                + preview
                + (f"\n… {payload.get('row_count', len(rows))} rows total" if len(rows) > 25 else "")
            )
        else:
            answer = answer + "\n\n---\nSQL error: " + str(payload.get("error", "unknown"))

    return {
        "reply": answer or "(No text reply)",
        "steps": steps,
        "model": settings.llm_model,
    }


def _message_to_openai_dict(msg) -> dict[str, Any]:
    """Serialize an OpenAI ChatCompletionMessage to the dict format expected by the API."""
    d: dict[str, Any] = {"role": msg.role, "content": msg.content}
    if getattr(msg, "tool_calls", None):
        d["tool_calls"] = [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in msg.tool_calls
        ]
    return d


def run_agent_chat(db: Session, user_message: str, history: list[dict[str, str]]) -> dict[str, Any]:
    """
    history: list of {role: user|assistant, content: str} from the client (previous turns only).
    """
    if not settings.openai_api_key:
        raise RuntimeError("LLM is not configured (missing SMARTEATS_OPENAI_API_KEY).")

    client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

    schema_block = _schema_digest()
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n\nExposed schema:\n" + schema_block},
    ]
    for turn in history:
        r = turn.get("role")
        c = turn.get("content", "")
        if r in ("user", "assistant") and isinstance(c, str):
            messages.append({"role": r, "content": c})
    messages.append({"role": "user", "content": user_message})

    steps: list[dict[str, Any]] = []
    max_iterations = 8

    for _ in range(max_iterations):
        response = _chat_completions_create(
            client,
            model=settings.llm_model,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.2,
        )
        if not _completion_has_usable_message(response):
            return _run_agent_json_mode(db, client, user_message, history)

        msg = (getattr(response, "choices", None) or [None])[0].message
        if msg is None:
            return _run_agent_json_mode(db, client, user_message, history)

        if not msg.tool_calls:
            text_out = (msg.content or "").strip()
            if text_out:
                return {
                    "reply": text_out,
                    "steps": steps,
                    "model": settings.llm_model,
                }
            return _run_agent_json_mode(db, client, user_message, history)

        messages.append(_message_to_openai_dict(msg))

        for tc in msg.tool_calls:
            if tc.type != "function":
                continue
            name = tc.function.name
            payload = _run_tool(db, name, tc.function.arguments)
            if name == "run_readonly_query":
                try:
                    sql_preview = (json.loads(tc.function.arguments or "{}").get("sql") or "")[:500]
                except json.JSONDecodeError:
                    sql_preview = (tc.function.arguments or "")[:500]
                steps.append(
                    {
                        "tool": name,
                        "ok": payload.get("ok"),
                        "sql_preview": sql_preview,
                    }
                )
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(payload, default=str),
                }
            )

    return {
        "reply": "Agent stopped after too many tool rounds; please narrow your question.",
        "steps": steps,
        "model": settings.llm_model,
    }


def agent_status() -> dict[str, Any]:
    return {
        "enabled": bool(settings.openai_api_key),
        "model": settings.llm_model,
        "base_url": settings.openai_base_url,
    }
