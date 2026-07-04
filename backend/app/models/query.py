from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QueryRequest(BaseModel):
    query: str
    llm_provider: Optional[str] = "gemini" # gemini, openai, groq

class CitationItem(BaseModel):
    citation_id: int
    document_title: str
    category: str
    page: int
    snippet: str

class AgentTraceItem(BaseModel):
    agent: str
    status: str
    timestamp: float
    description: str
    data: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    id: str
    query_id: str
    original_query: str
    optimized_query: str
    detected_category: str
    llm_provider: str
    generated_answer: str
    confidence_score: float
    is_escalated: bool
    escalation_reason: Optional[str] = None
    escalation_recommendation: Optional[str] = None
    citations: List[CitationItem]
    agent_trace: List[AgentTraceItem]
    execution_time_ms: int
    created_at: datetime

class FeedbackRequest(BaseModel):
    response_id: str
    rating: Optional[int] = 5
    is_helpful: Optional[bool] = True
    comments: Optional[str] = ""
