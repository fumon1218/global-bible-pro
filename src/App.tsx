import React, { useState } from 'react';
import { Book, Brain, Search, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

import ReadingMode from './components/Bible/ReadingMode';
import MemoryMode from './components/Memory/MemoryMode';

const SearchView = () => <div className="p-8">통합 검색 준비 중...</div>;
const SettingsView = () => <div className="p-8">환경 설정 준비 중...</div>;

type ViewMode = 'READING' | 'MEMORY' | 'SEARCH' | 'SETTINGS';

export default function App() {
  const [view, setView] = useState<ViewMode>('READING');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'READING', label: '성경 읽기', icon: Book },
    { id: 'MEMORY', label: '암송 수첩', icon: Brain },
    { id: 'SEARCH', label: '통합 검색', icon: Search },
    { id: 'SETTINGS', label: '환경 설정', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar for PC */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-primary)] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-xl flex items-center justify-center">
              <Book className="text-[var(--color-primary)]" />
            </div>
            <h1 className="text-xl font-bold premium-heading tracking-tight">Global Bible Pro</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as ViewMode);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200",
                  view === item.id 
                    ? "bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold shadow-lg" 
                    : "text-white/70 hover:bg-white/10"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <p className="text-xs text-white/40">© 2026 Global Bible Pro</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold premium-heading">Global Bible Pro</h1>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto">
          {view === 'READING' && <ReadingMode />}
          {view === 'MEMORY' && <MemoryMode />}
          {view === 'SEARCH' && <SearchView />}
          {view === 'SETTINGS' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
