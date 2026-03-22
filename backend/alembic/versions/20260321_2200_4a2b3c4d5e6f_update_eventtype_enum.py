"""Update EventType enum to match favorite states

Revision ID: 4a2b3c4d5e6f
Revises: 3115b290abd7
Create Date: 2026-03-21 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a2b3c4d5e6f'
down_revision = '3115b290abd7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL enum migration
    # Add new enum values (lowercase to match Python enum values)
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'interested'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'reached_out'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'showing_scheduled'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'viewed'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'applied'")
    op.execute("ALTER TYPE eventtype ADD VALUE IF NOT EXISTS 'rejected'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values easily
    # This would require recreating the type and all dependent columns
    pass
