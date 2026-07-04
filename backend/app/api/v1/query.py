import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import DBQuery, DBResponse, DBFeedback, DBUser
from app.models.query import QueryRequest, QueryResponse, FeedbackRequest
from app.agents.graph import run_supportiq_agent_pipeline
from app.api.deps import get_current_user

router = APIRouter(tags=["Query & Execution"])

@router.post("/query", response_model=QueryResponse)
def execute_query(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    start_time = time.time()
    user_query = request.query.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    # 1. Run LangGraph Multi-Agent Pipeline
    agent_output = run_supportiq_agent_pipeline(
        user_query=user_query,
        llm_provider=request.llm_provider or "gemini"
    )

    execution_time_ms = int((time.time() - start_time) * 1000)

    # 2. Persist Query to SQL DB
    query_record = DBQuery(
        user_id=current_user.id if hasattr(current_user, 'id') else None,
        original_query=user_query,
        optimized_query=agent_output.get("optimized_query"),
        detected_category=agent_output.get("detected_category")
    )
    db.add(query_record)
    db.commit()
    db.refresh(query_record)

    # 3. Persist Response to SQL DB
    response_record = DBResponse(
        query_id=query_record.id,
        llm_provider=request.llm_provider or "gemini",
        generated_answer=agent_output.get("generated_answer", ""),
        confidence_score=agent_output.get("confidence_score", 0.0),
        is_escalated=agent_output.get("is_escalated", False),
        escalation_reason=agent_output.get("escalation_reason"),
        citations=agent_output.get("citations", []),
        agent_trace=agent_output.get("agent_trace", []),
        execution_time_ms=execution_time_ms
    )
    db.add(response_record)
    db.commit()
    db.refresh(response_record)

    return {
        "id": response_record.id,
        "query_id": query_record.id,
        "original_query": user_query,
        "optimized_query": agent_output.get("optimized_query", user_query),
        "detected_category": agent_output.get("detected_category", "General Knowledge"),
        "llm_provider": request.llm_provider or "gemini",
        "generated_answer": agent_output.get("generated_answer", ""),
        "confidence_score": agent_output.get("confidence_score", 0.0),
        "is_escalated": agent_output.get("is_escalated", False),
        "escalation_reason": agent_output.get("escalation_reason"),
        "escalation_recommendation": agent_output.get("escalation_recommendation"),
        "citations": agent_output.get("citations", []),
        "agent_trace": agent_output.get("agent_trace", []),
        "execution_time_ms": execution_time_ms,
        "created_at": response_record.created_at
    }

@router.post("/feedback")
def submit_feedback(
    feedback_in: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    response_obj = db.query(DBResponse).filter(DBResponse.id == feedback_in.response_id).first()
    if not response_obj:
        raise HTTPException(status_code=404, detail="Response ID not found")

    fb = DBFeedback(
        response_id=feedback_in.response_id,
        user_id=current_user.id if hasattr(current_user, 'id') else None,
        rating=feedback_in.rating,
        is_helpful=feedback_in.is_helpful,
        comments=feedback_in.comments
    )
    db.add(fb)
    db.commit()
    return {"message": "Feedback submitted successfully", "feedback_id": fb.id}
