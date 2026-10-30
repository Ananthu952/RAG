from sqlalchemy import inspect, text

from app.database.base import Base
from app.database.models import (
    Conversation,
    ConversationMessage,
    Document,
    DocumentChunk,
)
from app.database.session import engine


def init_db():
    """
    Create all database tables and apply small schema updates
    required by the current application.
    """

    # Importing the models above ensures SQLAlchemy knows about
    # all current tables before create_all() runs.
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # ---------------------------------------------------------
    # Existing documents table migration
    # ---------------------------------------------------------

    if "documents" in tables:
        document_columns = {
            column["name"]
            for column in inspector.get_columns(
                "documents"
            )
        }

        # document_type was added after the original documents
        # table was created.
        if "document_type" not in document_columns:
            with engine.begin() as connection:
                connection.execute(
                    text(
                        """
                        ALTER TABLE documents
                        ADD COLUMN document_type VARCHAR(50)
                        NOT NULL DEFAULT 'general'
                        """
                    )
                )

    # ---------------------------------------------------------
    # Conversation tables
    # ---------------------------------------------------------
    #
    # Base.metadata.create_all() creates these automatically
    # if they don't exist:
    #
    # conversations
    # conversation_messages
    #
    # Existing conversation data is preserved.
    # ---------------------------------------------------------

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if "conversations" not in tables:
        # This should normally never be needed because
        # create_all() above creates it.
        Base.metadata.create_all(bind=engine)

    if "conversation_messages" not in tables:
        # Same safety check for the message table.
        Base.metadata.create_all(bind=engine)