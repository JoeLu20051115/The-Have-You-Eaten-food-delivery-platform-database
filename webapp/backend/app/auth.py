from __future__ import annotations

import base64
import hashlib
import hmac
import os
import re
import json
from binascii import Error as BinasciiError
from dataclasses import dataclass
from typing import Callable

from fastapi import HTTPException, Request, Response, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from .config import settings
from .db import SessionLocal


ROLE_PERMISSIONS = {
    "admin": ["read", "write"],
    "user": ["read"],
}

PHONE_PATTERN = re.compile(r"^[0-9]{11,20}$")


@dataclass(slots=True)
class AuthUser:
    username: str
    role: str
    customer_id: str | None = None

    @property
    def permissions(self) -> list[str]:
        return ROLE_PERMISSIONS.get(self.role, [])


def hash_password(password: str, iterations: int = 390000) -> str:
    salt = base64.urlsafe_b64encode(os.urandom(16)).decode("ascii").rstrip("=")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    encoded = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return f"pbkdf2_sha256${iterations}${salt}${encoded}"


def verify_password(password: str, stored_value: str) -> bool:
    if not stored_value:
        return False

    if len(stored_value) == 64 and all(character in "0123456789abcdef" for character in stored_value.lower()):
        return hmac.compare_digest(hashlib.sha256(password.encode("utf-8")).hexdigest(), stored_value.lower())

    if stored_value.startswith("plain$"):
        return hmac.compare_digest(password, stored_value.split("$", 1)[1])

    if not stored_value.startswith("pbkdf2_sha256$"):
        return hmac.compare_digest(password, stored_value)

    try:
        _, iterations_raw, salt, expected = stored_value.split("$", 3)
        iterations = int(iterations_raw)
    except ValueError:
        return False

    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    encoded = base64.urlsafe_b64encode(derived).decode("ascii").rstrip("=")
    return hmac.compare_digest(encoded, expected)


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def _cookie_signature(payload: str) -> str:
    digest = hmac.new(
        settings.session_secret_key.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return _b64encode(digest)


def _encode_session(user: AuthUser) -> str:
    payload = {
        "username": user.username,
        "role": user.role,
        "customer_id": user.customer_id,
    }
    encoded_payload = _b64encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    return f"{encoded_payload}.{_cookie_signature(encoded_payload)}"


def _decode_session(token: str) -> AuthUser | None:
    try:
        payload_part, signature_part = token.split(".", 1)
    except ValueError:
        return None

    expected_signature = _cookie_signature(payload_part)
    if not hmac.compare_digest(signature_part, expected_signature):
        return None

    try:
        payload = json.loads(_b64decode(payload_part).decode("utf-8"))
    except (ValueError, UnicodeDecodeError, BinasciiError, json.JSONDecodeError):
        return None

    username = payload.get("username")
    role = payload.get("role")
    customer_id = payload.get("customer_id")
    if not username or role not in ROLE_PERMISSIONS:
        return None
    return AuthUser(username=username, role=role, customer_id=customer_id)


def set_auth_cookie(response: Response, user: AuthUser) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=_encode_session(user),
        httponly=True,
        secure=settings.session_https_only,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        httponly=True,
        secure=settings.session_https_only,
        samesite="lax",
        path="/",
    )


def _authenticate_admin(username: str, password: str) -> AuthUser | None:
    if not settings.admin_username or not settings.admin_password_hash:
        return None
    if username != settings.admin_username:
        return None
    if not verify_password(password, settings.admin_password_hash):
        return None
    return AuthUser(username=username, role="admin")


def _authenticate_customer(username: str, password: str) -> AuthUser | None:
    with SessionLocal() as db:
        row = db.execute(
            text(
                """
                SELECT customer_id, user_name, password_hash
                FROM customer
                WHERE user_name = :username
                LIMIT 1
                """
            ),
            {"username": username},
        ).mappings().first()

    if row is None or not verify_password(password, row["password_hash"]):
        return None
    return AuthUser(username=row["user_name"], role="user", customer_id=row["customer_id"])


def _next_customer_id() -> str:
    with SessionLocal() as db:
        current = db.execute(
            text(
                """
                SELECT customer_id
                FROM customer
                WHERE customer_id REGEXP '^C[0-9]+$'
                ORDER BY CAST(SUBSTRING(customer_id, 2) AS UNSIGNED) DESC
                LIMIT 1
                """
            )
        ).scalar_one_or_none()

    next_number = int(current[1:]) + 1 if current else 1
    return f"C{next_number:03d}"


def register_user(username: str, phone: str, password: str) -> AuthUser:
    normalized_username = username.strip()
    normalized_phone = phone.strip()
    if not normalized_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username cannot be empty")
    if normalized_username == settings.admin_username:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is reserved")
    if not PHONE_PATTERN.fullmatch(normalized_phone):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number must contain 11 to 20 digits")

    customer_id = _next_customer_id()
    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

    with SessionLocal() as db:
        existing = db.execute(
            text(
                """
                SELECT user_name, phone
                FROM customer
                WHERE user_name = :username OR phone = :phone
                LIMIT 1
                """
            ),
            {"username": normalized_username, "phone": normalized_phone},
        ).mappings().first()
        if existing is not None:
            if existing["user_name"] == normalized_username:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number is already registered")

        try:
            db.execute(
                text(
                    """
                    INSERT INTO customer (customer_id, user_name, password_hash, phone)
                    VALUES (:customer_id, :username, :password_hash, :phone)
                    """
                ),
                {
                    "customer_id": customer_id,
                    "username": normalized_username,
                    "password_hash": password_hash,
                    "phone": normalized_phone,
                },
            )
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Registration failed because the account already exists") from exc

    return AuthUser(username=normalized_username, role="user", customer_id=customer_id)


def authenticate_user(username: str, password: str) -> AuthUser | None:
    admin = _authenticate_admin(username, password)
    if admin is not None:
        return admin
    return _authenticate_customer(username, password)


def get_optional_user(request: Request) -> AuthUser | None:
    token = request.cookies.get(settings.session_cookie_name)
    if not token:
        return None
    return _decode_session(token)


def require_roles(*allowed_roles: str) -> Callable[[Request], AuthUser]:
    def dependency(request: Request) -> AuthUser:
        user = get_optional_user(request)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency
