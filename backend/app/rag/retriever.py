from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore


class Retriever:
    """
    Handles semantic retrieval from the vector store.
    """

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.embedding_service = EmbeddingService()

    def retrieve(
        self,
        question: str,
        top_k: int = 5,
    ):
        """
        Retrieve the most relevant chunks for a question.
        """

        question_embedding = self.embedding_service.encode([question])

        results = self.vector_store.search(
            question_embedding,
            top_k=top_k,
        )

        return results