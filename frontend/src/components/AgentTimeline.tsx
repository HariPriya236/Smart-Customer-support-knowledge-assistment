import React from 'react';
import { AgentTraceStep } from '../types';
import { BrainCircuit, Database, CheckCircle2, FileText, AlertOctagon, RefreshCw } from 'lucide-react';

interface AgentTimelineProps {
  trace: AgentTraceStep[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ trace }) => {
  const getAgentIcon = (agentName: string) => {
    if (agentName.includes("Query")) return BrainCircuit;
    if (agentName.includes("Retrieval")) return Database;
    if (agentName.includes("Validation")) return CheckCircle2;
    if (agentName.includes("Generation")) return FileText;
    return AlertOctagon;
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-dark-border pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5 text-brand-accent animate-spin" style={{ animationDuration: '6s' }} />
          <span>LangGraph Multi-Agent Workflow Timeline</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">5 Agents Active</span>
      </div>

      <div className="space-y-2.5 relative pl-2">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800"></div>

        {trace.map((step, idx) => {
          const Icon = getAgentIcon(step.agent);
          const isFlagged = step.status === 'flagged';
          const isRetry = step.status === 'retrying';

          return (
            <div key={idx} className="relative flex items-start space-x-3 text-xs group">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-white font-bold transition-all ${
                isFlagged 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                  : isRetry 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-brand-primary/20 text-brand-accent border border-brand-primary/40'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/80 group-hover:border-brand-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{step.agent}</span>
                  <span className="font-mono text-[10px] text-slate-400">+{step.timestamp}s</span>
                </div>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
