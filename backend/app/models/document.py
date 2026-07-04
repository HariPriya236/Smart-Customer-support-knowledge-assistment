from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    doc_category: str
    chunk_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentReindexResponse(BaseModel):
    doc_id: str
    status: str
    chunk_count: int
    message: str
