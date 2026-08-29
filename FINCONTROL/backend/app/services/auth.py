import base64
import hashlib
import hmac
import os
import re
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.identity import Membership, MembershipRole, Organization, User

_SLUG_PATTERN = re.compile(r"[^a-z0-9]+")
_SCRYPT_N = 2**14


class AuthenticationError(Exception):
    """Raised for deliberately non-specific credential failures."""


class ConflictError(Exception):
    """Raised for unique identity conflicts."""


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_SCRYPT_N, r=8, p=1)
    return f"scrypt$16384$8$1${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, n, r, p, salt_b64, digest_b64 = encoded.split("$")
        if algorithm != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode(),
            salt=base64.b64decode(salt_b64),
            n=int(n),
            r=int(r),
            p=int(p),
        )
        return hmac.compare_digest(digest, base64.b64decode(digest_b64))
    except (ValueError, TypeError, UnicodeError):
        return False


def slugify(name: str) -> str:
    slug = _SLUG_PATTERN.sub("-", name.lower()).strip("-")
    return slug[:70] or "organization"


def unique_slug(session: Session, organization_name: str) -> str:
    base = slugify(organization_name)
    candidate = base
    suffix = 2
    while session.scalar(select(Organization.id).where(Organization.slug == candidate)) is not None:
        candidate = f"{base[: 70 - len(str(suffix)) - 1]}-{suffix}"
        suffix += 1
    return candidate


def register(
    session: Session, *, organization_name: str, email: str, display_name: str, password: str
) -> tuple[User, Organization, Membership]:
    normalized_email = email.lower()
    if session.scalar(select(User.id).where(User.email == normalized_email)) is not None:
        raise ConflictError("An account with this email already exists.")
    organization = Organization(
        name=organization_name, slug=unique_slug(session, organization_name)
    )
    user = User(
        email=normalized_email, display_name=display_name, password_hash=hash_password(password)
    )
    session.add_all([organization, user])
    session.flush()
    membership = Membership(
        organization_id=organization.id, user_id=user.id, role=MembershipRole.OWNER
    )
    session.add(membership)
    session.flush()
    return user, organization, membership


def authenticate(
    session: Session, *, email: str, password: str
) -> tuple[User, Organization, Membership]:
    user = session.scalar(select(User).where(User.email == email.lower()))
    if user is None or not verify_password(password, user.password_hash):
        raise AuthenticationError
    membership = session.scalar(select(Membership).where(Membership.user_id == user.id))
    if membership is None:
        raise AuthenticationError
    organization = session.get(Organization, membership.organization_id)
    if organization is None:
        raise AuthenticationError
    return user, organization, membership


def create_access_token(
    settings: Settings, *, user_id: uuid.UUID, organization_id: uuid.UUID, role: MembershipRole
) -> str:
    issued_at = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": str(user_id),
            "org": str(organization_id),
            "role": role.value,
            "iat": issued_at,
            "exp": issued_at + timedelta(minutes=settings.access_token_minutes),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
