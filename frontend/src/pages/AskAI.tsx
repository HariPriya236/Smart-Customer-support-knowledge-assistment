import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { queryKnowledgeBase } from '../services/api';
import { QueryResponseData, LLMProvider } from '../types';
import { ConfidenceGauge } from '../components/ConfidenceGauge';
import { AgentTimeline } from '../components/AgentTimeline';
import { CitationCard } from '../components/CitationCard';

interface AskAIProps {
  currentProvider: LLMProvider;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  data?: QueryResponseData;
  timestamp: string;
}

export const AskAI: React.FC<AskAIProps> = ({ currentProvider }) => {
  const location = useLocation();
  const initialQuery = (location.state as any)?.initialQuery || '';

  const [input, setInput] = useState(initialQuery);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeResponseData, setActiveResponseData] = useState<QueryResponseData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const responseData = await queryKnowledgeBase(q, currentProvider);
      setActiveResponseData(responseData);

      const aiMsg: ChatMessage = {
        id: responseData.id,
        sender: 'assistant',
        text: responseData.generated_answer,
        data: responseData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main Chat Thread */}
      <div className="flex-1 flex flex-col bg-dark-bg border-r border-dark-border">
        {/* Chat Header */}
        <div className="p-4 bg-dark-card/60 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/20 text-brand-accent flex items-center justify-center border border-brand-primary/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">SupportIQ Knowledge Assistant</h3>
              <p className="text-[10px] text-slate-400">Agentic RAG Engine Active • LangGraph Orchestrated</p>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Provider: <strong className="text-brand-accent uppercase">{currentProvider}</strong>
          </span>
        </div>

        {/* Message Thread Scroll View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center glow-indigo">
                <Sparkles className="w-8 h-8 text-brand-accent" />
              </div>
              <h2 className="font-extrabold text-white text-lg">Ask SupportIQ Assistant</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query enterprise PDFs, DOCX manuals, FAQs, and policies. Powered by 5 specialized AI agents for extreme precision.
              </p>
              <div className="w-full space-y-2 pt-2">
                {[
                  "What is our warranty replacement policy?",
                  "How to resolve Error 403 connection timeout?",
                  "What are the terms for 30-day refund claim?"
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="w-full text-left p-3 rounded-xl bg-dark-card border border-dark-border hover:border-brand-primary/40 text-xs text-slate-300 transition-all"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-indigo-500 flex items-center justify-center text-white shrink-0 shadow">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-brand-primary text-white font-medium rounded-tr-none shadow-md'
                    : 'bg-dark-card border border-dark-border text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Escalation Warning Banner */}
                {msg.data?.is_escalated && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Recommended Human Escalation</span>
                    </div>
                    <p><strong>Reason:</strong> {msg.data.escalation_reason}</p>
                    <p className="text-slate-300"><strong>Action:</strong> {msg.data.escalation_recommendation}</p>
                  </div>
                )}

                {/* Message Timestamp */}
                <div className="text-[10px] text-slate-400 font-mono text-right opacity-70">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                  U
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-accent">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span>LangGraph Multi-Agent Workflow Executing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-dark-card border-t border-dark-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-3 bg-dark-bg border border-dark-border rounded-2xl px-4 py-2.5 focus-within:border-brand-primary transition-all shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about FAQs, Manuals, Troubleshooting, Warranty, or Refunds..."
              className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white disabled:opacity-40 transition-all glow-indigo"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar: Agent Timeline, Confidence Gauge & Citations */}
      <div className="w-96 bg-dark-card/90 border-l border-dark-border p-5 overflow-y-auto space-y-6 hidden lg:block select-none">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Agent Reasoning & Verification
          </h3>
          {activeResponseData ? (
            <ConfidenceGauge score={activeResponseData.confidence_score} />
          ) : (
            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-dark-border text-xs text-slate-400 text-center">
              Submit a question to view real-time confidence scoring.
            </div>
          )}
        </div>

        {/* LangGraph Agent Workflow Timeline */}
        {activeResponseData && (
          <AgentTimeline trace={activeResponseData.agent_trace} />
        )}

        {/* Source Citations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
            <span>Retrieved Source Citations</span>
          </h3>

          {activeResponseData?.citations && activeResponseData.citations.length > 0 ? (
            <div className="space-y-2">
              {activeResponseData.citations.map((cit) => (
                <CitationCard key={cit.citation_id} citation={cit} />
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-dark-bg/60 border border-dark-border text-xs text-slate-500 text-center font-mono">
              No citations attached yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
