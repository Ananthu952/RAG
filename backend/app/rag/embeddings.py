
import os
import numpy as np


class EmbeddingService:
    """
    Supports MiniLM locally and Gemini in production.
    """

    _model = None

    def __init__(self):
        self.provider = os.getenv(
            "EMBEDDING_PROVIDER", "minilm"
        ).lower()

        if self.provider == "gemini":
            from langchain_google_genai import GoogleGenerativeAIEmbeddings

            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY is not configured")

            self.model = GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-001",
                google_api_key=api_key,
                output_dimensionality=768,
            )

        elif self.provider == "minilm":
            from sentence_transformers import SentenceTransformer

            if EmbeddingService._model is None:
                EmbeddingService._model = SentenceTransformer(
                    "sentence-transformers/all-MiniLM-L6-v2"
                )

            self.model = EmbeddingService._model

        else:
            raise ValueError(
                f"Unsupported embedding provider: {self.provider}"
            )

    def encode(self, texts):
        if self.provider == "gemini":
            embeddings = self.model.embed_documents(texts)
            return np.asarray(embeddings, dtype="float32")

        return self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
