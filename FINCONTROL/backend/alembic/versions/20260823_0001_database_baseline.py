"""Establish the FINCONTROL migration lineage.

Revision ID: 20260823_0001
Revises:
Create Date: 2026-08-23
"""

from collections.abc import Sequence

revision: str = "20260823_0001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    """Create no tables; Phase 5 adds the first domain schema migration."""


def downgrade() -> None:
    """Baseline migrations are intentionally no-ops."""
