import logging
import hashlib
from typing import List
from langchain_core.embeddings import Embeddings
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_embeddings() -> Embeddings:
    """
    Returns an embeddings provider based on EMBEDDING_PROVIDER setting.

    Priority:
      1. gemini  → GoogleGenerativeAIEmbeddings (lightweight, API-based, no PyTorch)
      2. huggingface → HuggingFaceEmbeddings   (local, requires sentence-transformers+torch)
      3. fallback → deterministic hash-based embeddings (offline/dev only)
    """
    provider = settings.EMBEDDING_PROVIDER.lower()

    # ── Gemini (default for cloud deployments) ────────────────────────────────
    if provider == "gemini" and settings.GEMINI_API_KEY:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            logger.info("Using Gemini embeddings (text-embedding-004).")
            return GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.GEMINI_API_KEY
            )
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini Embeddings: {e}. Falling back.")

    # ── HuggingFace (local – only works when sentence-transformers is installed) ─
    if provider == "huggingface":
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            logger.info("Using HuggingFace local embeddings (all-MiniLM-L6-v2).")
            return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Failed to load HuggingFace Embeddings: {e}. Using hash-based fallback.")

    # ── Hash-based fallback (no external deps – dev/offline only) ────────────
    logger.warning(
        "Using deterministic hash-based FallbackEmbeddings. "
        "Semantic search will NOT work correctly. "
        "Set EMBEDDING_PROVIDER=gemini and provide GEMINI_API_KEY for production."
    )
    return FallbackEmbeddings()


class FallbackEmbeddings(Embeddings):
    """
    Deterministic vector embedding generator for offline/fallback operation.
    Generates a 384-dimensional normalized vector from text hashing.
    NOTE: This does NOT produce semantic embeddings — for dev/testing only.
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
        norm = sum(x * x for x in vec) ** 0.5
        return [x / (norm if norm > 0 else 1.0) for x in vec]
