from app.core.logger import app_logger
from app.rag.chunker import Chunker
from app.rag.embeddings import EmbeddingService
from app.core.dependencies import vector_store
from app.services.pdf_service import PDFService


class RAGPipeline:
    """
    Handles document indexing.
    """

    def __init__(self):

        self.chunker = Chunker()
        self.embedding_service = EmbeddingService()
        self.vector_store = vector_store

    def index_document(
        self,
        file_path: str,
        document_id: int,
    ):

        # Extract pages
        pages = PDFService.extract_text(file_path)

        # Split into chunks
        chunks = self.chunker.split_pages(pages)

        # Generate embeddings
        embeddings = self.embedding_service.encode(
            [chunk["text"] for chunk in chunks]
        )

        # Store vectors, scoped to this document
        self.vector_store.add(
            document_id,
            embeddings,
            chunks,
        )

        app_logger.info(
            f"{len(chunks)} chunks indexed for document_id={document_id}."
        )

        return chunks