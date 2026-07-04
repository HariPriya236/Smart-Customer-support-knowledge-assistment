import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Smile, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { fetchAnalytics, fetchQueryHistory } from '../services/api';
import { AnalyticsData, QueryResponseData } from '../types';
import { UploadModal } from '../components/UploadModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentQueries, setRecentQueries] = useState<QueryResponseData[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics().then(setAnalytics);
    fetchQueryHistory().then(setRecentQueries);
  }, []);

  const kpis = [
    { title: 'Total Indexed Docs', value: analytics?.overview.total_documents || 14, icon: FileText, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { title: 'Queries Processed', value: analytics?.overview.queries_processed || 1280, icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Average AI Confidence', value: `${((analytics?.overview.avg_confidence || 0.92) * 100).toFixed(1)}%`, icon: ShieldCheck, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { title: 'User Satisfaction', value: `${analytics?.overview.satisfaction_score || 94.5}%`, icon: Smile, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  ];

  const suggestedQuestions = [
    "What is the standard warranty coverage for defective hardware?",
    "How to process a customer refund request within 30 days?",
    "Steps to troubleshoot Error 403 network connection failure"
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border p-6 rounded-3xl glow-indigo shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-brand-primary/20 text-brand-accent text-xs font-bold border border-brand-primary/30 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agentic RAG v2.5</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">SupportIQ Knowledge Command Center</h1>
          <p className="text-slate-400 text-sm">
            Empower your support team with autonomous LangGraph agents, multi-LLM reasoning, and source citations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-dark-bg hover:bg-slate-800 border border-dark-border flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4 text-brand-accent" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primaryHover flex items-center space-x-2 glow-indigo shadow-lg transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-brand-primary/40 transition-all shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
              <div className={`p-2.5 rounded-xl border ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono">{kpi.value}</span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12.4%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Suggested Queries */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 lg:col-span-1">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-brand-accent" />
            <span>Quick Support Assistant Queries</span>
          </h3>
          <div className="space-y-2.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => navigate('/chat', { state: { initialQuery: q } })}
                className="w-full text-left p-3 rounded-xl bg-dark-bg/80 border border-dark-border hover:border-brand-primary/40 hover:bg-dark-surface/60 text-xs text-slate-300 font-medium transition-all group flex items-center justify-between"
              >
                <span className="truncate pr-2">{q}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-accent transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Agent Queries Stream */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h3 className="font-bold text-white text-sm">Recent Agent Resolved Queries</h3>
            <button onClick={() => navigate('/chat')} className="text-xs font-semibold text-brand-accent hover:underline flex items-center space-x-1">
              <span>View Chat Thread</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentQueries.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                    {item.detected_category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence: {(item.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="font-semibold text-slate-200">{item.original_query}</p>
                <p className="text-slate-400 line-clamp-2 leading-relaxed">{item.generated_answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => fetchAnalytics().then(setAnalytics)}
      />
    </div>
  );
};
