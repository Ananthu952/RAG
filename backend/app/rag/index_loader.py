from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import vector_store
from app.core.logger import app_logger
from app.database.models import Document, DocumentChunk


def restore_vector_store(db: Session) -> None:
    """
    Rebuild the in-memory FAISS vector store from what was already
    indexed and persisted to disk/DB in a previous run.

    Called once on application startup. For each document that has
    both a saved FAISS index file and chunk rows in the database, the
    index is loaded from disk and its metadata is reattached from the
    document_chunks table, in the same order the chunks were
    originally indexed in (page, then chunk_index) — this must match
    the order they were added to the FAISS index in, or retrieved
    results will point to the wrong text.
    """

    vector_dir = Path(settings.VECTOR_DB_DIR)

    if not vector_dir.exists():
        app_logger.info(
            "No vector store directory found; nothing to restore."
        )
        return

    documents = db.query(Document).all()

    restored_count = 0

    for document in documents:

        index_path = vector_dir / f"{document.id}.index"

        if not index_path.exists():
            continue

        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document.id)
            .order_by(DocumentChunk.page_number, DocumentChunk.chunk_index)
            .all()
        )

        if not chunks:
            app_logger.warning(
                f"FAISS index file exists for document_id={document.id} "
                "but no chunk rows were found in the database; skipping."
            )
            continue

        metadata = [
            {
                "page": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                "text": chunk.chunk_text,
            }
            for chunk in chunks
        ]

        try:
            vector_store.load(document.id, str(index_path), metadata)
        except Exception as exc:
            app_logger.warning(
                f"Could not restore index for document {document.id}: {exc}"
            )
            continue

        restored_count += 1

    app_logger.info(
        f"Restored {restored_count} document(s) into the vector store."
    )