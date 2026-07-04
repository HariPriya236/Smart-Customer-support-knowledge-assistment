from pydantic import BaseModel
from typing import List, Dict, Any

class OverviewMetrics(BaseModel):
    total_documents: int
    queries_processed: int
    avg_confidence: float
    satisfaction_score: float
    escalation_rate: float
    avg_response_time_ms: float

class QueryTrendPoint(BaseModel):
    date: str
    queries: int
    confidence: float
    escalations: int

class CategoryBreakdown(BaseModel):
    category: str
    count: int
    percentage: float

class AgentPerformanceItem(BaseModel):
    agent_name: str
    avg_time_ms: float
    success_rate: float

class AnalyticsDashboardResponse(BaseModel):
    overview: OverviewMetrics
    query_trends: List[QueryTrendPoint]
    category_breakdown: List[CategoryBreakdown]
    top_questions: List[Dict[str, Any]]
    agent_performance: List[AgentPerformanceItem]
