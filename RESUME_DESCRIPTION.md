# SupportIQ - Resume Project Description (ATS-Optimized)

## Bullet Points for Resume / Portfolio

### **SupportIQ – Smart Customer Support Knowledge Assistant**
* **Role**: Principal AI Architect & Full Stack Lead Engineer
* **Tech Stack**: Python, FastAPI, React, TypeScript, Tailwind CSS, LangGraph, LangChain, Google Gemini 2.5 Flash, OpenAI GPT-4o, Groq, ChromaDB, PostgreSQL, Docker, GitHub Actions.

---

### Key Accomplishments & Technical Highlights:

- **Designed & Implemented Agentic RAG Multi-Agent Architecture**: Built an enterprise customer support knowledge assistant utilizing **LangGraph** orchestrating 5 specialized autonomous agents (*Query Understanding*, *Retrieval*, *Knowledge Validation*, *Answer Generation*, and *Escalation*).
- **Engineered Multi-LLM Provider Layer**: Architected dynamic runtime model switching supporting **Google Gemini 2.5 Flash**, **OpenAI GPT-4o**, and **Groq Llama 3**, with automatic failover handling and mock fallback mechanisms for zero-downtime offline execution.
- **Optimized Document Retrieval & Ingestion Pipeline**: Developed multi-format parser handling PDFs, DOCX, TXT, Markdown, and CSV using `RecursiveCharacterTextSplitter` (1000 chunk size / 200 overlap) and persistent **ChromaDB** vector storage with Gemini embeddings.
- **Built Production React + TypeScript Dashboard**: Created a dark SaaS interface featuring a real-time multi-agent workflow timeline, interactive confidence gauge, citation cards, drag-and-drop document upload modal, and Recharts analytics.
- **Implemented Verification & System Evaluation Benchmark**: Created `evaluate_system.py` evaluating 100 synthetic support queries, measuring system accuracy, precision, recall, F1 score, retrieval accuracy, and hallucination containment.
- **Enterprise Security & DevOps**: Configured JWT authentication, Role-Based Access Control (RBAC), rate-limiting middleware, multi-stage Docker builds, PostgreSQL schemas, and GitHub Actions CI/CD pipelines.

---

## Short Project Summary (1-Paragraph Format)

> **SupportIQ** is an enterprise AI customer support knowledge assistant built with Python FastAPI, React, TypeScript, Tailwind CSS, and LangGraph. It leverages Agentic RAG and vector search (ChromaDB) across multi-format documentation (PDFs, DOCX, FAQs, policies) to synthesize precise answers with numerical citations. Featuring multi-LLM engine switching (Google Gemini 2.5 Flash, OpenAI, Groq), reflection retry loops, confidence scoring, automated human escalation recommendations, and an evaluation benchmark tracking precision/recall across 100 test queries, SupportIQ reduces support query resolution times while maintaining strict factual grounding.
