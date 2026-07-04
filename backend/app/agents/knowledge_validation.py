import json
import time
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.state import AgentState, AgentStepTrace
from app.services.llm_factory import LLMFactory

KNOWLEDGE_VALIDATION_SYSTEM_PROMPT = """
You are the Knowledge Validation Agent for SupportIQ.

Your responsibilities:
1. Review the user's question and retrieved document chunks.
2. Filter out irrelevant or noisy information.
3. Assess the factual coverage and confidence score (between 0.00 and 1.00).
4. Decide if the information is sufficient to answer accurately or if a query reflection/retry is required.

Output ONLY valid JSON matching this schema:
{
  "validated_context": "Cleaned, combined context string with chunk reference markers like [1], [2]",
  "confidence_score": 0.85,
  "needs_retry": false,
  "reason": "Clear justification of validation status"
}
"""

def knowledge_validation_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    user_query = state.get("user_query")
    chunks = state.get("retrieved_chunks", [])
    provider = state.get("llm_provider", "gemini")
    reflection_count = state.get("reflection_count", 0)

    if not chunks:
        # No chunks retrieved
        trace: AgentStepTrace = {
            "agent": "Knowledge Validation Agent",
            "status": "flagged",
            "timestamp": round(time.time() - start_time, 3),
            "description": "Zero relevant chunks found in knowledge base.",
            "data": {"confidence_score": 0.1}
        }
        agent_trace = list(state.get("agent_trace", []))
        agent_trace.append(trace)
        return {
            **state,
            "validated_context": "",
            "confidence_score": 0.1,
            "agent_trace": agent_trace
        }

    chunks_text = "\n\n".join([f"Chunk [{c['chunk_id']}] (Source: {c['source']}):\n{c['content']}" for c in chunks])
    
    llm = LLMFactory.get_llm(provider=provider, temperature=0.1)

    prompt = f"User Question: {user_query}\n\nRetrieved Knowledge Chunks:\n{chunks_text}\n\nValidate and output JSON:"
    messages = [
        SystemMessage(content=KNOWLEDGE_VALIDATION_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ]

    confidence_score = 0.85
    validated_context = chunks_text
    needs_retry = False

    try:
        response = llm.invoke(messages)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        validated_context = data.get("validated_context", chunks_text)
        confidence_score = float(data.get("confidence_score", 0.85))
        needs_retry = bool(data.get("needs_retry", False))
    except Exception:
        # Standard heuristic calculation
        total_len = sum(len(c["content"]) for c in chunks)
        confidence_score = min(0.95, 0.5 + (total_len / 3000.0))

    # Reflection loop trigger if low confidence and within reflection count limit
    if confidence_score < 0.5 and reflection_count < state.get("max_reflections", 2):
        needs_retry = True

    trace: AgentStepTrace = {
        "agent": "Knowledge Validation Agent",
        "status": "retrying" if needs_retry else "completed",
        "timestamp": round(time.time() - start_time, 3),
        "description": f"Validated context with {confidence_score*100:.1f}% confidence." + (" Triggering reflection loop." if needs_retry else ""),
        "data": {
            "confidence_score": confidence_score,
            "needs_retry": needs_retry
        }
    }

    agent_trace = list(state.get("agent_trace", []))
    agent_trace.append(trace)

    return {
        **state,
        "validated_context": validated_context,
        "confidence_score": confidence_score,
        "reflection_count": reflection_count + (1 if needs_retry else 0),
        "agent_trace": agent_trace
    }
