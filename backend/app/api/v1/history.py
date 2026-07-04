from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import DBQuery, DBResponse, DBUser
from app.models.query import QueryResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/history", tags=["Query History"])

@router.get("", response_model=List[QueryResponse])
def get_query_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    results = (
        db.query(DBQuery, DBResponse)
        .join(DBResponse, DBQuery.id == DBResponse.query_id)
        .order_by(DBQuery.created_at.desc())
        .limit(limit)
        .all()
    )

    history_list = []
    for q, r in results:
        history_list.append({
            "id": r.id,
            "query_id": q.id,
            "original_query": q.original_query,
            "optimized_query": q.optimized_query or q.original_query,
            "detected_category": q.detected_category or "General Knowledge",
            "llm_provider": r.llm_provider,
            "generated_answer": r.generated_answer,
            "confidence_score": r.confidence_score,
            "is_escalated": r.is_escalated,
            "escalation_reason": r.escalation_reason,
            "escalation_recommendation": None,
            "citations": r.citations or [],
            "agent_trace": r.agent_trace or [],
            "execution_time_ms": r.execution_time_ms or 0,
            "created_at": r.created_at
        })

    return history_list
