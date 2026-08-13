from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Document(Base):
    """
    Stores uploaded PDF metadata.
    """

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    total_pages: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="uploaded",
    )

    upload_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    chunks: Mapped[list["DocumentChunk"]] = relationship(
    back_populates="document",
    cascade="all, delete-orphan",
    )

class DocumentChunk(Base):
    """
    Stores text chunks extracted from uploaded PDFs.
    """

    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id"),
        nullable=False,
    )

    page_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    chunk_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    document: Mapped["Document"] = relationship(
        back_populates="chunks",
    )