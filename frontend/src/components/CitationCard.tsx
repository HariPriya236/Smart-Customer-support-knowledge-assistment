import React, { useState } from 'react';
import { Citation } from '../types';
import { BookOpen, FileText, ChevronRight, ExternalLink } from 'lucide-react';

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-dark-bg/80 border border-dark-border hover:border-brand-primary/40 rounded-xl p-3 text-xs transition-all">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="w-5 h-5 rounded-md bg-brand-primary/20 text-brand-accent flex items-center justify-center font-bold font-mono text-[10px]">
            [{citation.citation_id}]
          </span>
          <div className="truncate">
            <h4 className="font-semibold text-slate-200 truncate">{citation.document_title}</h4>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {citation.category}
              </span>
              <span>Page {citation.page}</span>
            </div>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg font-mono text-[11px] leading-relaxed">
          <p className="text-slate-400 italic mb-1 text-[10px]">Indexed Knowledge Chunk:</p>
          "{citation.snippet}"
        </div>
      )}
    </div>
  );
};
