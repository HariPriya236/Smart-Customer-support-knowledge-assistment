import time
from app.agents.state import AgentState, AgentStepTrace

def escalation_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    confidence = state.get("confidence_score", 0.0)
    answer = state.get("generated_answer", "")
    chunks = state.get("retrieved_chunks", [])

    # Escalation threshold rules
    is_escalated = False
    escalation_reason = None
    recommendation = "Response provided with high confidence from verified knowledge base."

    if confidence < 0.60:
        is_escalated = True
        escalation_reason = f"Low AI confidence score ({confidence*100:.1f}%)."
        recommendation = "Recommend routing to Tier-2 Customer Support Executive. Verify user account details and log ticket in CRM."
    elif not chunks:
        is_escalated = True
        escalation_reason = "No matching documentation found in enterprise vector database."
        recommendation = "Escalate to Domain SME / Content Manager to add missing documentation to knowledge base."
    elif "could not find relevant information" in answer.lower():
        is_escalated = True
        escalation_reason = "Knowledge gap detected during answer synthesis."
        recommendation = "Create a new support ticket and assign to Product Ops for follow-up."

    trace: AgentStepTrace = {
        "agent": "Escalation Agent",
        "status": "flagged" if is_escalated else "completed",
        "timestamp": round(time.time() - start_time, 3),
        "description": "Escalation Flagged: " + (escalation_reason if is_escalated else "No escalation required."),
        "data": {
            "is_escalated": is_escalated,
            "escalation_reason": escalation_reason,
            "recommendation": recommendation
        }
    }

    agent_trace = list(state.get("agent_trace", []))
    agent_trace.append(trace)

    return {
        **state,
        "is_escalated": is_escalated,
        "escalation_reason": escalation_reason,
        "escalation_recommendation": recommendation,
        "agent_trace": agent_trace
    }
