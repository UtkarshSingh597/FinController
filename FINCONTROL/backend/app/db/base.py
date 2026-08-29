# ruff: noqa: E402

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared SQLAlchemy metadata for all persisted domain entities."""


# Import models so Alembic observes their metadata before autogeneration.
from app.models import (
    financial,  # noqa: E402, F401
    identity,  # noqa: E402, F401
)
