"""User conversation relationship

Revision ID: ff0ad2c2908b
Revises: 9a550cc4a2c3
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers
revision = 'ff0ad2c2908b'
down_revision = '9a550cc4a2c3'
branch_labels = None
depends_on = None

def upgrade():
    connection = op.get_bind()
    
    # Step 1: Add the column as nullable first
    op.add_column('conversations', sa.Column('user_id', sa.Integer(), nullable=True))
    
    # Step 2: Check if there are existing conversations
    result = connection.execute(text("SELECT COUNT(*) FROM conversations"))
    conv_count = result.scalar()
    
    if conv_count > 0:
        # Step 3: Ensure we have at least one user
        result = connection.execute(text('SELECT COUNT(*) FROM "user"'))
        user_count = result.scalar()
        
        if user_count == 0:
            # Create a default user for existing conversations - include ALL required fields
            connection.execute(text("""
                INSERT INTO "user" (username, email, password, terms_accepted, disabled, created_at) 
                VALUES ('system_default', 'system@rafikeyai.com', 'hashed_temp_password', true, false, NOW())
            """))
        
        # Step 4: Get the first available user ID
        result = connection.execute(text('SELECT id FROM "user" ORDER BY id LIMIT 1'))
        default_user_id = result.scalar()
        
        # Step 5: Update all existing conversations with this user ID
        connection.execute(text(f"UPDATE conversations SET user_id = {default_user_id} WHERE user_id IS NULL"))
    
    # Step 6: Now make the column NOT NULL (safe because we've handled existing data)
    op.alter_column('conversations', 'user_id', nullable=False)
    
    # Step 7: Add foreign key constraint
    op.create_foreign_key(
        'fk_conversations_user_id', 
        'conversations', 
        'user', 
        ['user_id'], 
        ['id']
    )
    
    # Step 8: Add index for performance
    op.create_index('ix_conversations_user_id', 'conversations', ['user_id'])

def downgrade():
    op.drop_index('ix_conversations_user_id', 'conversations')
    op.drop_constraint('fk_conversations_user_id', 'conversations', type_='foreignkey')
    op.drop_column('conversations', 'user_id')
