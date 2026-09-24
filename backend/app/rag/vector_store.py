import faiss
import numpy as np


class VectorStore:
    """
    FAISS vector database.

    Maintains one FAISS index per document_id.

    Supports:
    - Semantic search for normal questions
    - Retrieving all chunks from a specific document
    - Saving indexes to disk
    - Loading indexes from disk
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

        # document_id -> faiss.IndexFlatIP
        self.indices: dict[int, faiss.IndexFlatIP] = {}

        # document_id -> list of chunk metadata
        #
        # The order MUST match the order of vectors stored
        # inside the corresponding FAISS index.
        self.metadata: dict[int, list[dict]] = {}

    def add(
        self,
        document_id: int,
        embeddings: np.ndarray,
        chunks: list[dict],
    ):
        """
        Add embeddings and their metadata for a document.
        """

        if document_id not in self.indices:
            self.indices[document_id] = faiss.IndexFlatIP(
                self.dimension
            )
            self.metadata[document_id] = []

        embeddings = embeddings.astype("float32")

        self.indices[document_id].add(embeddings)

        self.metadata[document_id].extend(chunks)

    def search(
        self,
        embedding: np.ndarray,
        document_id: int | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        """
        Semantic search.

        If document_id is provided:
            Search only inside that document.

        If document_id is None:
            Search across all indexed documents and return
            the highest-scoring results overall.
        """

        if document_id is not None:
            return self._search_single(
                document_id,
                embedding,
                top_k,
            )

        results = []

        for doc_id in self.indices:
            results.extend(
                self._search_single(
                    doc_id,
                    embedding,
                    top_k,
                )
            )

        results.sort(
            key=lambda result: result["score"],
            reverse=True,
        )

        return results[:top_k]

    def _search_single(
        self,
        document_id: int,
        embedding: np.ndarray,
        top_k: int,
    ) -> list[dict]:
        """
        Search inside a single document.
        """

        index = self.indices.get(document_id)

        if index is None or index.ntotal == 0:
            return []

        k = min(
            top_k,
            index.ntotal,
        )

        scores, indices = index.search(
            embedding.astype("float32"),
            k,
        )

        doc_metadata = self.metadata.get(
            document_id,
            [],
        )

        results = []

        for score, idx in zip(
            scores[0],
            indices[0],
        ):
            if idx == -1:
                continue

            if idx >= len(doc_metadata):
                continue

            results.append(
                {
                    "score": float(score),
                    "document_id": document_id,
                    **doc_metadata[idx],
                }
            )

        return results

    def get_document_chunks(
        self,
        document_id: int,
    ) -> list[dict]:
        """
        Return all indexed chunks belonging to a document.

        This is different from semantic search.

        Semantic search returns the most relevant chunks for
        a specific question.

        This method returns the entire indexed document context,
        which is needed for document-level operations such as:

        - Explain
        - Summarize
        - Generate revision notes
        - Generate study material
        """

        document_metadata = self.metadata.get(
            document_id,
            [],
        )

        if not document_metadata:
            return []

        chunks = []

        for chunk in document_metadata:
            chunks.append(
                {
                    "score": 1.0,
                    "document_id": document_id,
                    **chunk,
                }
            )

        return chunks

    def get_document_chunk_count(
        self,
        document_id: int,
    ) -> int:
        """
        Return the number of indexed chunks for a document.
        """

        return len(
            self.metadata.get(
                document_id,
                [],
            )
        )

    def has_document(
        self,
        document_id: int,
    ) -> bool:
        """
        Check whether a document has been indexed.
        """

        index = self.indices.get(document_id)

        return (
            index is not None
            and index.ntotal > 0
        )

    def save(
        self,
        document_id: int,
        index_path: str,
    ):
        """
        Persist a document's FAISS index to disk.

        Only the vectors are stored in the FAISS index.

        Chunk metadata is stored separately and restored
        from the database by the index loader.
        """

        index = self.indices.get(
            document_id
        )

        if index is None:
            return

        faiss.write_index(
            index,
            index_path,
        )

    def load(
        self,
        document_id: int,
        index_path: str,
        metadata: list[dict],
    ):
        """
        Load a previously saved FAISS index.

        The metadata list must be in exactly the same order
        as the vectors were originally added.
        """

        index = faiss.read_index(
            index_path
        )

        self.indices[document_id] = index

        self.metadata[document_id] = metadata