import faiss
import numpy as np


class VectorStore:
    """
    FAISS vector database.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)

        self.metadata = []

    def add(
        self,
        embeddings: np.ndarray,
        chunks: list[dict],
    ):
        """
        Store vectors and metadata.
        """

        self.index.add(embeddings.astype("float32"))

        self.metadata.extend(chunks)

    def search(
        self,
        embedding: np.ndarray,
        top_k: int = 5,
    ):
        """
        Semantic search.
        """

        scores, indices = self.index.search(
            embedding.astype("float32"),
            top_k,
        )

        results = []

        for score, idx in zip(scores[0], indices[0]):

            if idx == -1:
                continue

            results.append(
                {
                    "score": float(score),
                    **self.metadata[idx],
                }
            )

        return results