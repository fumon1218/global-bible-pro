import React, { useState } from 'react';
import { Book, Brain, Search, Settings as SettingsIcon, Menu, X, Users, Share2, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from './lib/utils';

import ReadingMode from './components/Bible/ReadingMode';
import MemoryMode from './components/Memory/MemoryMode';
import BibleSearch from './components/Bible/BibleSearch';
import TrackerMode from './components/Tracker/TrackerMode';
import BibleMap from './components/Bible/BibleMap';
import { ReadingProvider } from './contexts/ReadingContext';

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

type ViewMode = 'READING' | 'MEMORY' | 'SEARCH' | 'TRACKER' | 'MAP' | 'SETTINGS';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewMode>('READING');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'READING', label: t('menu.reading'), icon: Book },
    { id: 'MEMORY', label: t('menu.memory'), icon: Brain },
    { id: 'TRACKER', label: t('menu.tracker'), icon: Users },
    { id: 'SEARCH', label: t('menu.search'), icon: Search },
    { id: 'MAP', label: '성경 지도', icon: Map },
    { id: 'SETTINGS', label: t('menu.settings'), icon: SettingsIcon },
  ];

  return (
    <ReadingProvider>
      <div className="flex min-h-screen bg-[var(--color-bg)]">
        {/* Sidebar for PC */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-[90] w-64 bg-[var(--color-primary)] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
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
              <div className="pt-2 px-4">
                <p className="text-[9px] font-black text-white/30 tracking-widest uppercase opacity-80">Version 1.3.1 Premium</p>
              </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
              <button
                onClick={async () => {
                  const shareData = {
                    title: 'Global Bible Journey Pro',
                    text: '전 세계 성경 통독의 동반자, 프리미엄 성경 통독 플랫폼 Global Bible Pro에 초대합니다!',
                    url: 'https://fumon1218.github.io/global-bible-pro/'
                  };
                  if (navigator.share) {
                    try { await navigator.share(shareData); } catch (e) {}
                  } else {
                    await navigator.clipboard.writeText(shareData.url);
                    alert('앱 링크가 복사되었습니다! 친구에게 전달해보세요.');
                  }
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/5 text-white/70 hover:bg-white/10 transition-all border border-white/5 active:scale-95"
              >
                  <Share2 size={18} className="text-[var(--color-secondary)]" />
                  <span className="text-sm font-bold">{t('menu.share')}</span>
                </button>
              <div className="flex flex-col gap-1 px-1">
                <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">© 2026 Global Bible Pro</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <main className="flex-1 overflow-y-auto no-scrollbar relative">
            {view === 'READING' && <ReadingMode onOpenSidebar={() => setIsSidebarOpen(true)} />}
            {view === 'MEMORY' && <MemoryMode />}
            {view === 'SEARCH' && (
              <SearchView onSelect={(b, c, v) => {
                setView('READING');
                localStorage.setItem('gbp_last_ref', JSON.stringify({ b, c, v }));
                window.dispatchEvent(new Event('gbp_navigate'));
              }} />
            )}
            {view === 'TRACKER' && <TrackerMode />}
            {view === 'MAP' && <BibleMap />}
            {view === 'SETTINGS' && <SettingsView />}
          </main>
        </div>

        {/* Global Mobile Overlay for Sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ReadingProvider>
  );
}
