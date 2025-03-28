"""added organisation schema

Revision ID: fb034372a0ac
Revises: 
Create Date: 2025-03-20 15:48:32.531958

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fb034372a0ac'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('attendance_session', schema=None) as batch_op:
        batch_op.add_column(sa.Column('organization_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('creator_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(None, 'user', ['creator_id'], ['id'])
        batch_op.create_foreign_key(None, 'organization', ['organization_id'], ['id'])

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password_hash', sa.String(length=255), nullable=False))
        batch_op.add_column(sa.Column('organization_id', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('role', sa.Enum('admin', 'supervisor', 'user', name='user_roles'), nullable=False))
        batch_op.create_foreign_key(None, 'organization', ['organization_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('role')
        batch_op.drop_column('organization_id')
        batch_op.drop_column('password_hash')

    with op.batch_alter_table('attendance_session', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('creator_id')
        batch_op.drop_column('organization_id')

    # ### end Alembic commands ###
