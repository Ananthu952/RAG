from sqlalchemy import inspect, text

from app.database.base import Base
from app.database.models import Document, DocumentChunk
from app.database.session import engine


def init_db():
    """
    Create all database tables and apply small schema updates
    required by the current application.
    """

    # Create tables that do not already exist.
    Base.metadata.create_all(bind=engine)

    # Apply lightweight schema updates for existing databases.
    inspector = inspect(engine)

    if "documents" not in inspector.get_table_names():
        return

    document_columns = {
        column["name"]
        for column in inspector.get_columns("documents")
    }

    # document_type was added after the original documents table
    # was created. SQLite's CREATE TABLE IF NOT EXISTS will not
    # add new columns to an existing table, so add it explicitly.
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