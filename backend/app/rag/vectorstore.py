import os
import logging
from typing import List, Dict, Any
from langchain_core.documents import Document
from app.core.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """
    Manages vector storage (ChromaDB or FAISS) for document chunks and retrieval queries.
    """
    def __init__(self):
        self.embeddings = get_embeddings()
        self.db_type = settings.VECTOR_DB_TYPE.lower()
        self.chroma_dir = settings.CHROMA_PERSIST_DIR
        self._vector_store = None
        self._init_vector_store()

    def _init_vector_store(self):
        os.makedirs(self.chroma_dir, exist_ok=True)
        if self.db_type == "chroma":
            try:
                from langchain_community.vectorstores import Chroma
                self._vector_store = Chroma(
                    collection_name="support_knowledge",
                    embedding_function=self.embeddings,
                    persist_directory=self.chroma_dir
                )
            except Exception as e:
                logger.warning(f"ChromaDB initialization fallback: {e}")
                self._init_in_memory_store()
        else:
            self._init_in_memory_store()

    def _init_in_memory_store(self):
        from langchain_community.vectorstores import DocArrayInMemorySearch
        self._vector_store = DocArrayInMemorySearch.from_texts(
            texts=["SupportIQ initial knowledge base initialized."],
            embedding=self.embeddings,
            metadatas=[{"source": "system", "doc_id": "sys-001", "filename": "system.txt", "doc_category": "System"}]
        )

    def add_documents(self, documents: List[Document]) -> List[str]:
        if not documents:
            return []
        ids = self._vector_store.add_documents(documents)
        if hasattr(self._vector_store, "persist") and callable(self._vector_store.persist):
            self._vector_store.persist()
        return ids

    def similarity_search(self, query: str, k: int = None) -> List[Document]:
        k = k or settings.TOP_K_RETRIEVAL
        try:
            return self._vector_store.similarity_search(query, k=k)
        except Exception as e:
            logger.error(f"Error executing vector similarity search: {e}")
            return []

    def delete_by_doc_id(self, doc_id: str) -> bool:
        try:
            if hasattr(self._vector_store, "_collection"):
                self._vector_store._collection.delete(where={"doc_id": doc_id})
                return True
        except Exception as e:
            logger.error(f"Error deleting doc {doc_id} from vector store: {e}")
        return False

# Global singleton
vector_store_manager = VectorStoreManager()
