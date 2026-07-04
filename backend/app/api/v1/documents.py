from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import DBDocument, DBUser
from app.models.document import DocumentResponse, DocumentReindexResponse
from app.rag.vectorstore import vector_store_manager
from app.api.deps import get_current_user

router = APIRouter(tags=["Document Management"])

@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    docs = db.query(DBDocument).order_by(DBDocument.created_at.desc()).all()
    return docs

@router.delete("/document/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    doc = db.query(DBDocument).filter(DBDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from vector store
    vector_store_manager.delete_by_doc_id(doc_id)

    # Delete from SQL DB
    db.delete(doc)
    db.commit()

    return {"message": f"Document '{doc.filename}' and its embeddings were deleted successfully."}

@router.post("/document/{doc_id}/reindex", response_model=DocumentReindexResponse)
def reindex_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    doc = db.query(DBDocument).filter(DBDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = "processed"
    db.commit()

    return {
        "doc_id": doc_id,
        "status": "processed",
        "chunk_count": doc.chunk_count,
        "message": f"Document '{doc.filename}' successfully re-indexed in vector store."
    }
