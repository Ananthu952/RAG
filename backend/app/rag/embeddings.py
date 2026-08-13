from sentence_transformers import SentenceTransformer


class EmbeddingService:

    _model = None

    def __init__(self):
        if EmbeddingService._model is None:
            EmbeddingService._model = SentenceTransformer(
                "sentence-transformers/all-MiniLM-L6-v2"
            )

    def encode(self, texts):
        return EmbeddingService._model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )