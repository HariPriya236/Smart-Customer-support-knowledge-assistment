import React from 'react';
import { LLMProvider } from '../types';
import { Cpu, User, ChevronDown, Bell } from 'lucide-react';

interface NavbarProps {
  currentProvider: LLMProvider;
  onProviderChange: (provider: LLMProvider) => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProvider,
  onProviderChange,
  title = "SupportIQ Assistant Dashboard"
}) => {
  return (
    <header className="h-16 bg-dark-card/90 backdrop-blur-md border-b border-dark-border px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h2 className="font-bold text-slate-100 text-base tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Provider Switcher Dropdown */}
        <div className="flex items-center space-x-2 bg-dark-bg/80 border border-dark-border px-3 py-1.5 rounded-xl text-xs">
          <Cpu className="w-4 h-4 text-brand-accent" />
          <span className="text-slate-400 font-medium">LLM Engine:</span>
          <select
            value={currentProvider}
            onChange={(e) => onProviderChange(e.target.value as LLMProvider)}
            className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-1"
          >
            <option value="gemini" className="bg-dark-card text-white">Google Gemini 2.5 Flash (Primary)</option>
            <option value="openai" className="bg-dark-card text-white">OpenAI GPT-4o-mini</option>
            <option value="groq" className="bg-dark-card text-white">Groq Llama 3.3 70B</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-surface/60 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-primary"></span>
        </button>

        {/* User Badge */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-dark-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">Alex Rivera</p>
            <p className="text-[10px] text-slate-400">Support Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
};
