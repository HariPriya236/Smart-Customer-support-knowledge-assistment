export type LLMProvider = 'gemini' | 'openai' | 'groq';

export interface Citation {
  citation_id: number;
  document_title: string;
  category: string;
  page: number;
  snippet: string;
}

export interface AgentTraceStep {
  agent: string;
  status: 'started' | 'completed' | 'retrying' | 'flagged';
  timestamp: number;
  description: string;
  data?: Record<string, any>;
}

export interface QueryResponseData {
  id: string;
  query_id: string;
  original_query: string;
  optimized_query: string;
  detected_category: string;
  llm_provider: LLMProvider;
  generated_answer: string;
  confidence_score: number;
  is_escalated: boolean;
  escalation_reason?: string;
  escalation_recommendation?: string;
  citations: Citation[];
  agent_trace: AgentTraceStep[];
  execution_time_ms: number;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  doc_category: string;
  chunk_count: number;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  created_at: string;
}

export interface AnalyticsData {
  overview: {
    total_documents: number;
    queries_processed: number;
    avg_confidence: number;
    satisfaction_score: number;
    escalation_rate: number;
    avg_response_time_ms: number;
  };
  query_trends: Array<{
    date: string;
    queries: number;
    confidence: number;
    escalations: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  top_questions: Array<{
    question: string;
    count: number;
    category: string;
    satisfaction: number;
  }>;
  agent_performance: Array<{
    agent_name: string;
    avg_time_ms: number;
    success_rate: number;
  }>;
}
