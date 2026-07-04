import json
import time
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.state import AgentState, AgentStepTrace
from app.services.llm_factory import LLMFactory

QUERY_UNDERSTANDING_SYSTEM_PROMPT = """
You are the Query Understanding Agent for SupportIQ, an enterprise customer support knowledge assistant.

Your primary responsibilities:
1. Understand the user's core intent.
2. Detect the relevant document category from these options:
   - FAQs
   - User Manuals
   - Product Documentation
   - Troubleshooting Guides
   - Warranty Policies
   - Refund Policies
   - Internal Knowledge Bases
3. Rewrite the user's question into an optimized vector search query stripped of conversational filler.

Output ONLY valid JSON matching this schema:
{
  "detected_category": "Category Name",
  "optimized_query": "Optimized keyword-rich search query",
  "intent": "Short summary of user intent"
}
"""

def query_understanding_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    user_query = state.get("user_query", "")
    provider = state.get("llm_provider", "gemini")
    
    llm = LLMFactory.get_llm(provider=provider, temperature=0.1)

    prompt = f"User Question: {user_query}\n\nAnalyze and output JSON:"
    messages = [
        SystemMessage(content=QUERY_UNDERSTANDING_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ]

    detected_category = "General Knowledge"
    optimized_query = user_query

    try:
        response = llm.invoke(messages)
        content = response.content.strip()
        
        # Clean potential markdown JSON formatting
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()

        data = json.loads(content)
        detected_category = data.get("detected_category", "General Knowledge")
        optimized_query = data.get("optimized_query", user_query)
    except Exception:
        # Fallback keyword extraction heuristic
        q_lower = user_query.lower()
        if "warranty" in q_lower:
            detected_category = "Warranty Policies"
        elif "refund" in q_lower or "return" in q_lower:
            detected_category = "Refund Policies"
        elif "fix" in q_lower or "error" in q_lower or "problem" in q_lower:
            detected_category = "Troubleshooting Guides"
        elif "manual" in q_lower or "how to" in q_lower:
            detected_category = "User Manuals"
        elif "faq" in q_lower:
            detected_category = "FAQs"
        else:
            detected_category = "Product Documentation"

    # Add step trace
    trace: AgentStepTrace = {
        "agent": "Query Understanding Agent",
        "status": "completed",
        "timestamp": round(time.time() - start_time, 3),
        "description": f"Detected category '{detected_category}' & optimized search terms.",
        "data": {
            "category": detected_category,
            "optimized_query": optimized_query
        }
    }

    agent_trace = list(state.get("agent_trace", []))
    agent_trace.append(trace)

    return {
        **state,
        "detected_category": detected_category,
        "optimized_query": optimized_query,
        "agent_trace": agent_trace
    }
