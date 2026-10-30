from app.rag.chunker import Chunker
from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore


class RAGPipeline:

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.chunker = Chunker()
        self.embedding_service = EmbeddingService()

    def index_document(
        self,
        document_id: int,
        pages: list[dict],
    ) -> list[dict]:
        """
        Split extracted PDF pages into chunks,
        generate embeddings, and store them
        in the document-specific FAISS index.
        """

        # --------------------------------------------------
        # 1. Split pages into chunks
        # --------------------------------------------------

        chunks = self.chunker.split_pages(pages)

        if not chunks:
            return []

        # --------------------------------------------------
        # 2. Remove empty chunks
        # --------------------------------------------------

        valid_chunks = [
            chunk
            for chunk in chunks
            if chunk.get("text", "").strip()
        ]

        if not valid_chunks:
            return []

        # --------------------------------------------------
        # 3. Prepare text for embeddings
        # --------------------------------------------------

        texts = [
            chunk["text"].strip()
            for chunk in valid_chunks
        ]

        if not texts:
            return []

        # --------------------------------------------------
        # 4. Generate embeddings
        # --------------------------------------------------

        embeddings = self.embedding_service.encode(texts)

        if embeddings is None:
            return []

        if len(embeddings) == 0:
            return []

        # --------------------------------------------------
        # 5. Store embeddings
        # --------------------------------------------------

        self.vector_store.add(
            document_id,
            embeddings,
            valid_chunks,
        )

        # --------------------------------------------------
        # 6. Return chunks
        # --------------------------------------------------

        return valid_chunks