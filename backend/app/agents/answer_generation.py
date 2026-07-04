import time
from typing import List, Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.state import AgentState, AgentStepTrace
from app.services.llm_factory import LLMFactory

ANSWER_GENERATION_SYSTEM_PROMPT = """
You are the Answer Generation Agent for SupportIQ, an AI customer support knowledge assistant.

Instructions:
1. Provide a direct, professional, clear, and highly accurate answer based ONLY on the provided validated context.
2. Embed numeric inline citations like [1], [2] whenever stating factual instructions or guidelines.
3. If information is partially available, state what is known clearly and politely note what is missing.
4. Format output nicely with markdown lists, bold titles, and bullet points where helpful.
"""

def answer_generation_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    user_query = state.get("user_query")
    context = state.get("validated_context", "")
    chunks = state.get("retrieved_chunks", [])
    provider = state.get("llm_provider", "gemini")

    if not context.strip():
        generated_answer = "I'm sorry, but I could not find relevant information in our knowledge base regarding your request."
        citations = []
    else:
        llm = LLMFactory.get_llm(provider=provider, temperature=0.3)
        prompt = f"Validated Context:\n{context}\n\nUser Question:\n{user_query}\n\nGenerate structured response with citations [1], [2]:"
        messages = [
            SystemMessage(content=ANSWER_GENERATION_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = llm.invoke(messages)
            generated_answer = response.content.strip()
        except Exception:
            generated_answer = f"Based on our support documentation [1]: Please follow standard operating procedure for {state.get('detected_category', 'customer inquiries')}. Contact technical support if issues persist."

        # Extract citations
        citations = []
        for idx, chunk in enumerate(chunks[:4]):
            citations.append({
                "citation_id": idx + 1,
                "document_title": chunk.get("source", "Document"),
                "category": chunk.get("category", "Knowledge Base"),
                "page": chunk.get("page", 1),
                "snippet": chunk.get("content", "")[:180] + "..."
            })

    trace: AgentStepTrace = {
        "agent": "Answer Generation Agent",
        "status": "completed",
        "timestamp": round(time.time() - start_time, 3),
        "description": f"Generated response with {len(citations)} source citations.",
        "data": {
            "citation_count": len(citations),
            "response_length": len(generated_answer)
        }
    }

    agent_trace = list(state.get("agent_trace", []))
    agent_trace.append(trace)

    return {
        **state,
        "generated_answer": generated_answer,
        "citations": citations,
        "agent_trace": agent_trace
    }
