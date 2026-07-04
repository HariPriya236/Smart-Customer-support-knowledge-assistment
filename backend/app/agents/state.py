import time
from typing import TypedDict, List, Dict, Any, Optional

class AgentStepTrace(TypedDict):
    agent: str
    status: str # started, completed, retrying, flagged
    timestamp: float
    description: str
    data: Optional[Dict[str, Any]]

class AgentState(TypedDict):
    user_query: str
    llm_provider: str
    detected_category: str
    optimized_query: str
    retrieved_chunks: List[Dict[str, Any]]
    validated_context: str
    generated_answer: str
    citations: List[Dict[str, Any]]
    confidence_score: float
    is_escalated: bool
    escalation_reason: Optional[str]
    escalation_recommendation: Optional[str]
    reflection_count: int
    max_reflections: int
    agent_trace: List[AgentStepTrace]
