from app.database.base import Base
from app.database.models import Document
from app.database.session import engine


def init_db():
    """
    Create all database tables.
    """
    Base.metadata.create_all(bind=engine)