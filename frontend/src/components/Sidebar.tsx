import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  FileText, 
  BarChart3, 
  Bot, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface SidebarProps {
  docCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ docCount = 14 }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Ask AI Assistant', path: '/chat', icon: MessageSquareCode, badge: 'Agentic' },
    { name: 'Documents', path: '/documents', icon: FileText, count: docCount },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-dark-border flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-indigo-400 flex items-center justify-center glow-indigo shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center space-x-1">
            <span>Support</span>
            <span className="text-brand-accent">IQ</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Knowledge Assistant</p>
        </div>
      </div>

      {/* Agent Engine Badge */}
      <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">LangGraph RAG</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Active
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary/15 text-brand-accent border border-brand-primary/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-dark-surface/60'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-accent border border-brand-primary/30">
                {item.badge}
              </span>
            )}
            {item.count !== undefined && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Security Status */}
      <div className="p-4 border-t border-dark-border">
        <div className="p-3 rounded-xl bg-dark-bg/60 border border-dark-border text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
              <span className="font-semibold">Security Level</span>
            </span>
            <span className="text-emerald-400 font-mono">RBAC + JWT</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Role: Support Agent (Verified)
          </p>
        </div>
      </div>
    </aside>
  );
};
