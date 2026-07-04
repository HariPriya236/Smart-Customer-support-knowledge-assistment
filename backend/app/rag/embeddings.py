import logging
import hashlib
from typing import List
from langchain_core.embeddings import Embeddings
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_embeddings() -> Embeddings:
    """
    Returns an embeddings provider instance based on system settings with automatic fallback.
    """
    provider = settings.EMBEDDING_PROVIDER.lower()

    if provider == "gemini" and settings.GEMINI_API_KEY:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            return GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.GEMINI_API_KEY
            )
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini Embeddings: {e}. Falling back to HuggingFace / Local.")

    if provider == "huggingface":
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Failed to load HuggingFace Embeddings: {e}. Falling back to deterministic local embeddings.")

    return FallbackEmbeddings()

class FallbackEmbeddings(Embeddings):
    """
    Deterministic vector embedding generator for offline/fallback operation.
    Generates a 384-dimensional normalized vector from text hashing.
    """
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_text(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_text(text)

    def _embed_text(self, text: str) -> List[float]:
        dim = 384
        vec = []
        for i in range(dim):
            h = hashlib.sha256(f"{text}_{i}".encode('utf-8')).hexdigest()
            val = (int(h[:8], 16) / 0xFFFFFFFF) * 2 - 1
            vec.append(val)
        
        # Normalize
        norm = sum(x*x for x in vec) ** 0.5
        return [x / (norm if norm > 0 else 1.0) for x in vec]
