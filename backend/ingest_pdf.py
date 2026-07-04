import sys
import os
sys.path.insert(0, os.getcwd())

from app.db.session import SessionLocal
from app.db.models import DBDocument
from app.rag.ingestion import DocumentIngestor
from app.rag.vectorstore import vector_store_manager

pdf_path = r"C:\Users\Admin\.gemini\antigravity\brain\8a702b37-1ee2-4263-9683-4d651345ee62\media__1783189649298.pdf"
filename = "Aptitude_and_Reasoning_Study_Guide.pdf"
doc_category = "General Knowledge"

if not os.path.exists(pdf_path):
    print(f"Error: PDF file not found at {pdf_path}")
    sys.exit(1)

print(f"Starting ingestion of {filename}...")
file_size = os.path.getsize(pdf_path)

db = SessionLocal()
try:
    # 1. Create DB Record
    doc_record = DBDocument(
        filename=filename,
        file_type="pdf",
        file_size=file_size,
        doc_category=doc_category,
        status="processing"
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)
    print(f"DB Record created with ID: {doc_record.id}")

    # 2. Parse & Split
    print("Parsing and splitting PDF pages...")
    ingestor = DocumentIngestor()
    chunks = ingestor.load_and_split(
        file_path=pdf_path,
        filename=filename,
        doc_category=doc_category,
        doc_id=doc_record.id
    )
    print(f"Split document into {len(chunks)} chunks.")

    # 3. Add to Vector Store
    print("Indexing chunks into vector database...")
    vector_store_manager.add_documents(chunks)
    print("Vector database indexing complete.")

    # 4. Update DB Record
    doc_record.chunk_count = len(chunks)
    doc_record.status = "processed"
    db.commit()
    print("Ingestion transaction committed successfully!")

except Exception as e:
    db.rollback()
    print(f"Error during ingestion: {e}")
finally:
    db.close()
