import React, { useState } from 'react';
import { Book, Brain, Search, Settings as SettingsIcon, Menu, X, Users } from 'lucide-react';
import { cn } from './lib/utils';

import ReadingMode from './components/Bible/ReadingMode';
import MemoryMode from './components/Memory/MemoryMode';
import BibleSearch from './components/Bible/BibleSearch';
import TrackerMode from './components/Tracker/TrackerMode';

const SearchView = ({ onSelect }: { onSelect: (b: string, c: number, v: number) => void }) => (
  <div className="h-full flex flex-col bg-white">
    <header className="p-8 pb-4">
      <h2 className="text-3xl font-bold premium-heading mb-2">통합 검색</h2>
      <p className="text-gray-400 text-sm">성경 전체에서 원하는 말씀을 찾아보세요.</p>
    </header>
    <div className="flex-1 overflow-hidden">
      <BibleSearch activeVersion="KRV" onSelectResult={onSelect} />
    </div>
  </div>
);

const SettingsView = () => (
  <div className="p-8 md:p-12 max-w-2xl mx-auto space-y-12">
    <header>
      <h2 className="text-4xl font-bold premium-heading mb-2">환경 설정</h2>
      <p className="text-gray-400">앱 사용 환경을 최적화하세요.</p>
    </header>
    
    <div className="space-y-8">
      <div className="card-premium p-6 flex items-center justify-between">
        <div>
          <h4 className="font-bold">다크 모드</h4>
          <p className="text-xs text-gray-400 mt-1">준비 중인 기능입니다.</p>
        </div>
        <div className="w-12 h-6 bg-gray-200 rounded-full relative">
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
        </div>
      </div>
      
      <div className="card-premium p-6 space-y-4">
        <h4 className="font-bold">글꼴 크기</h4>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">작게</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[var(--color-secondary)]" />
          </div>
          <span className="text-lg text-gray-400">크게</span>
        </div>
      </div>
    </div>
  </div>
);

type ViewMode = 'READING' | 'MEMORY' | 'SEARCH' | 'TRACKER' | 'SETTINGS';

export default function App() {
  const [view, setView] = useState<ViewMode>('READING');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'READING', label: '성경 읽기', icon: Book },
    { id: 'MEMORY', label: '암송 수첩', icon: Brain },
    { id: 'TRACKER', label: '읽기표', icon: Users },
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
          {view === 'SEARCH' && (
            <SearchView onSelect={(b, c, v) => {
              setView('READING');
              // This part needs a way to pass the selection to ReadingMode
              // For now, we'll assume ReadingMode handles internal state
              // In a real app, we'd use a Context or a shared state.
              localStorage.setItem('gbp_last_ref', JSON.stringify({ b, c, v }));
              window.dispatchEvent(new Event('gbp_navigate'));
            }} />
          )}
          {view === 'TRACKER' && <TrackerMode />}
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
