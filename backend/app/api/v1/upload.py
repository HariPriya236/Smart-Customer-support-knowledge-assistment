import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import DBDocument, DBUser
from app.models.document import DocumentResponse
from app.rag.ingestion import DocumentIngestor
from app.rag.vectorstore import vector_store_manager
from app.api.deps import get_current_user

router = APIRouter(tags=["Document Management"])

ingestor = DocumentIngestor()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_category: str = Form("General Knowledge"),
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".docx", ".doc", ".txt", ".md", ".csv"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported: PDF, DOCX, TXT, MD, CSV."
        )

    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        file_size = os.path.getsize(tmp_path)

        # Create DB record first
        doc_record = DBDocument(
            filename=filename,
            file_type=ext.lstrip("."),
            file_size=file_size,
            doc_category=doc_category,
            uploaded_by=current_user.id if hasattr(current_user, 'id') else None,
            status="processing"
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        # Parse & Split
        chunks = ingestor.load_and_split(
            file_path=tmp_path,
            filename=filename,
            doc_category=doc_category,
            doc_id=doc_record.id
        )

        # Add to Vector DB
        vector_store_manager.add_documents(chunks)

        # Update status
        doc_record.chunk_count = len(chunks)
        doc_record.status = "processed"
        db.commit()
        db.refresh(doc_record)

        return doc_record

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
