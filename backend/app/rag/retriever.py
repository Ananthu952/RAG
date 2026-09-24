from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore


class Retriever:
    """
    Handles retrieval from the vector store.

    Two retrieval modes are supported:

    1. Semantic retrieval:
       Used for normal user questions.

    2. Document retrieval:
       Used for document-level operations such as
       explain and summarize.
    """

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.embedding_service = EmbeddingService()

    def retrieve(
        self,
        question: str,
        document_id: int | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        """
        Retrieve the most relevant chunks for a question.

        If document_id is provided, retrieval is restricted
        to that document.
        """

        question_embedding = self.embedding_service.encode(
            [question]
        )

        return self.vector_store.search(
            question_embedding,
            document_id=document_id,
            top_k=top_k,
        )

    def retrieve_document(
        self,
        document_id: int,
    ) -> list[dict]:
        """
        Retrieve all indexed chunks belonging to a document.

        Unlike semantic retrieval, this does not perform an
        embedding search. It returns the complete indexed
        document context.

        Used for document-level operations such as:

        - Explain
        - Summarize
        """

        return self.vector_store.get_document_chunks(
            document_id
        )