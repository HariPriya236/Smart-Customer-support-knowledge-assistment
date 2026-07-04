import logging
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.query_understanding import query_understanding_agent
from app.agents.retrieval import retrieval_agent
from app.agents.knowledge_validation import knowledge_validation_agent
from app.agents.answer_generation import answer_generation_agent
from app.agents.escalation import escalation_agent

logger = logging.getLogger(__name__)

def should_retry_reflection(state: AgentState) -> str:
    """Conditional edge decision for Knowledge Validation Agent reflection loop."""
    reflection_count = state.get("reflection_count", 0)
    max_reflections = state.get("max_reflections", 2)
    confidence = state.get("confidence_score", 1.0)

    if confidence < 0.50 and reflection_count < max_reflections:
        logger.info(f"Triggering reflection retry attempt #{reflection_count + 1}")
        return "retry"
    return "proceed"

def build_supportiq_graph():
    """Builds and compiles the production LangGraph workflow."""
    workflow = StateGraph(AgentState)

    # 1. Add agent nodes
    workflow.add_node("query_understanding", query_understanding_agent)
    workflow.add_node("retrieval", retrieval_agent)
    workflow.add_node("knowledge_validation", knowledge_validation_agent)
    workflow.add_node("answer_generation", answer_generation_agent)
    workflow.add_node("escalation", escalation_agent)

    # 2. Define workflow connections
    workflow.set_entry_point("query_understanding")
    workflow.add_edge("query_understanding", "retrieval")
    workflow.add_edge("retrieval", "knowledge_validation")

    # 3. Conditional Reflection Edge from Knowledge Validation
    workflow.add_conditional_edges(
        "knowledge_validation",
        should_retry_reflection,
        {
            "retry": "query_understanding", # Loop back for query re-optimization
            "proceed": "answer_generation"
        }
    )

    workflow.add_edge("answer_generation", "escalation")
    workflow.add_edge("escalation", END)

    return workflow.compile()

# Master Compiled LangGraph Orchestrator
supportiq_app = build_supportiq_graph()

def run_supportiq_agent_pipeline(
    user_query: str, 
    llm_provider: str = "gemini"
) -> Dict[str, Any]:
    """Helper entry point for executing query processing through LangGraph."""
    initial_state: AgentState = {
        "user_query": user_query,
        "llm_provider": llm_provider,
        "detected_category": "",
        "optimized_query": user_query,
        "retrieved_chunks": [],
        "validated_context": "",
        "generated_answer": "",
        "citations": [],
        "confidence_score": 0.0,
        "is_escalated": False,
        "escalation_reason": None,
        "escalation_recommendation": None,
        "reflection_count": 0,
        "max_reflections": 2,
        "agent_trace": []
    }

    final_state = supportiq_app.invoke(initial_state)
    return final_state
