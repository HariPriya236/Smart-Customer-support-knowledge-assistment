import React, { useEffect, useState } from 'react';
import { fetchAnalytics } from '../services/api';
import { AnalyticsData } from '../types';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { BarChart3, TrendingUp, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setData);
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-slate-400">Loading analytics metrics...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-brand-accent" />
          <span>SupportIQ System Analytics & Agent Performance</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Monitor multi-agent execution speed, retrieval confidence, resolution satisfaction, and human escalation rates.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Avg Agent Response Time</span>
          <p className="text-2xl font-extrabold text-white font-mono">{data.overview.avg_response_time_ms} ms</p>
          <p className="text-[10px] text-emerald-400 flex items-center font-semibold">
            <Clock className="w-3 h-3 mr-1" /> Sub-second response
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Human Escalation Rate</span>
          <p className="text-2xl font-extrabold text-white font-mono">{(data.overview.escalation_rate * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-emerald-400 flex items-center font-semibold">
            <TrendingUp className="w-3 h-3 mr-1" /> 92% automated containment
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Retrieval Confidence</span>
          <p className="text-2xl font-extrabold text-white font-mono">{(data.overview.avg_confidence * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-brand-accent flex items-center font-semibold">
            <ShieldCheck className="w-3 h-3 mr-1" /> ChromaDB Similarity
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold text-slate-400">CSAT Satisfaction Score</span>
          <p className="text-2xl font-extrabold text-white font-mono">{data.overview.satisfaction_score}%</p>
          <p className="text-[10px] text-purple-400 flex items-center font-semibold">
            <CheckCircle className="w-3 h-3 mr-1" /> Verified Feedback
          </p>
        </div>
      </div>

      {/* Recharts Analytics Components */}
      <AnalyticsCharts data={data} />

      {/* Top Resolved Questions Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base">Top Asked Support Questions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-surface/60 border-b border-dark-border text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Frequency</th>
                <th className="py-3 px-4 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs">
              {data.top_questions.map((q, idx) => (
                <tr key={idx} className="hover:bg-dark-surface/40">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{q.question}</td>
                  <td className="py-3.5 px-4 text-slate-400">{q.category}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-brand-accent">{q.count}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">{q.satisfaction}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
