import time
from app.agents.state import AgentState, AgentStepTrace
from app.rag.vectorstore import vector_store_manager

def retrieval_agent(state: AgentState) -> AgentState:
    start_time = time.time()
    optimized_query = state.get("optimized_query") or state.get("user_query")
    category = state.get("detected_category")

    # Search vector store
    retrieved_docs = vector_store_manager.similarity_search(optimized_query, k=5)

    formatted_chunks = []
    for idx, doc in enumerate(retrieved_docs):
        metadata = doc.metadata or {}
        formatted_chunks.append({
            "chunk_id": idx + 1,
            "content": doc.page_content,
            "source": metadata.get("filename", "Internal Knowledge Base"),
            "doc_id": metadata.get("doc_id", "doc-default"),
            "category": metadata.get("doc_category", category),
            "page": metadata.get("page", 1)
        })

    trace: AgentStepTrace = {
        "agent": "Retrieval Agent",
        "status": "completed",
        "timestamp": round(time.time() - start_time, 3),
        "description": f"Retrieved {len(formatted_chunks)} top knowledge chunks from vector DB.",
        "data": {
            "retrieved_count": len(formatted_chunks),
            "sources": list(set([c["source"] for c in formatted_chunks]))
        }
    }

    agent_trace = list(state.get("agent_trace", []))
    agent_trace.append(trace)

    return {
        **state,
        "retrieved_chunks": formatted_chunks,
        "agent_trace": agent_trace
    }
