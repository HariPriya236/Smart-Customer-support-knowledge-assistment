import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AskAI } from './pages/AskAI';
import { Documents } from './pages/Documents';
import { Analytics } from './pages/Analytics';
import { LLMProvider } from './types';

export const App: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<LLMProvider>('gemini');

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-dark-bg text-slate-100 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Navbar
            currentProvider={currentProvider}
            onProviderChange={setCurrentProvider}
          />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<AskAI currentProvider={currentProvider} />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
