import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfidenceGaugeProps {
  score: number; // 0.0 to 1.0
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ score, size = 'md' }) => {
  const percentage = Math.round(score * 100);

  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let gaugeColor = '#10B981';
  let label = 'High Confidence';
  let Icon = ShieldCheck;

  if (percentage < 60) {
    colorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    gaugeColor = '#F43F5E';
    label = 'Low Confidence';
    Icon = AlertTriangle;
  } else if (percentage < 80) {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    gaugeColor = '#F59E0B';
    label = 'Moderate Confidence';
    Icon = HelpCircle;
  }

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${colorClass} backdrop-blur-md transition-all`}>
      <div className="relative flex items-center justify-center w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-800"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            strokeDasharray={`${percentage}, 100`}
            strokeWidth="3"
            strokeLinecap="round"
            stroke={gaugeColor}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-xs font-extrabold text-white font-mono">{percentage}%</span>
      </div>
      <div>
        <div className="flex items-center space-x-1.5">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">LangGraph Verification Score</p>
      </div>
    </div>
  );
};
