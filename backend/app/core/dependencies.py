import os

from app.rag.vector_store import VectorStore

embedding_provider = os.getenv(
    "EMBEDDING_PROVIDER",
    "minilm"
).lower()

dimension = 768 if embedding_provider == "gemini" else 384

vector_store = VectorStore(dimension=dimension)