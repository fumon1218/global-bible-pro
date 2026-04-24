import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Heart, ChevronRight, Search, Eye, EyeOff, Star, Trash2, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LEGACY_MEMORY_VERSES, categories } from '../../data/memoryData';

export default function MemoryMode() {
  const [activeTab, setActiveTab] = useState<'HANDBOOK' | 'PERSONAL'>('HANDBOOK');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [savedVerses, setSavedVerses] = useState<any[]>([]);
  const [hiddenVerses, setHiddenVerses] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load personal saved verses from localStorage
  useEffect(() => {
    const loadSaved = () => {
      const keys = JSON.parse(localStorage.getItem('gbp_saved_verses') || '[]');
      const verses = keys.map((key: string) => {
        const data = localStorage.getItem(`gbp_verse_data_${key}`);
        return data ? JSON.parse(data) : null;
      }).filter(Boolean);
      setSavedVerses(verses);
    };
    loadSaved();
    window.addEventListener('storage', loadSaved);
    return () => window.removeEventListener('storage', loadSaved);
  }, []);

  const toggleHide = (id: string) => {
    setHiddenVerses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const removePersonalVerse = (key: string) => {
    const keys = JSON.parse(localStorage.getItem('gbp_saved_verses') || '[]');
    const newKeys = keys.filter((k: string) => k !== key);
    localStorage.setItem('gbp_saved_verses', JSON.stringify(newKeys));
    localStorage.removeItem(`gbp_verse_data_${key}`);
    setSavedVerses(prev => prev.filter(v => `${v.bookId}_${v.chap}_${v.vers}` !== key));
  };

  const filteredHandbook = LEGACY_MEMORY_VERSES.filter(v => 
    v.categoryId === selectedCategory && 
    (v.text.includes(searchQuery) || v.reference.includes(searchQuery))
  );

  const filteredPersonal = savedVerses.filter(v => 
    v.text.includes(searchQuery) || v.bookId.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-full bg-[#fdfcf8]">
      {/* Header */}
      <header className="p-8 md:p-12 pb-6 border-b border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold premium-heading mb-3">암송 수첩</h2>
            <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
              <Star size={16} fill="currentColor" />
              <span className="font-bold">총 {LEGACY_MEMORY_VERSES.length + savedVerses.length}개의 말씀 암송 중</span>
            </div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('HANDBOOK')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === 'HANDBOOK' ? "bg-white shadow-md text-[var(--color-primary)]" : "text-gray-400"
              )}
            >
              기본 암송 (300)
            </button>
            <button 
              onClick={() => setActiveTab('PERSONAL')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === 'PERSONAL' ? "bg-white shadow-md text-[var(--color-primary)]" : "text-gray-400"
              )}
            >
              개인 저장 ({savedVerses.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="말씀 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-12 pr-4 py-3 rounded-2xl shadow-sm focus:outline-none focus:ring-2 ring-[var(--color-secondary)]/30 transition-all"
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories (Only for Handbook) */}
        {activeTab === 'HANDBOOK' && (
          <aside className="w-64 border-r bg-white overflow-y-auto hidden lg:block p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">카테고리</div>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === cat.id 
                    ? "bg-[var(--color-primary)] text-white shadow-lg translate-x-2" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                )}
              >
                {cat.name}
              </button>
            ))}
          </aside>
        )}

        {/* Main Content: Verse List */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {activeTab === 'HANDBOOK' && (
            <div className="lg:hidden mb-6">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-200 p-3 rounded-xl font-bold"
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {(activeTab === 'HANDBOOK' ? filteredHandbook : filteredPersonal).map((verse: any) => {
              const id = activeTab === 'HANDBOOK' ? `legacy-${verse.id}` : `saved-${verse.bookId}_${verse.chap}_${verse.vers}`;
              const isHidden = hiddenVerses[id];
              const refText = activeTab === 'HANDBOOK' ? verse.reference : `${verse.bookId} ${verse.chap}:${verse.vers}`;

              return (
                <div key={id} className="card-premium p-6 flex flex-col group h-full hover:border-[var(--color-secondary)]/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 px-2 py-1 rounded">
                      {activeTab === 'HANDBOOK' ? verse.categoryName.split('. ')[1] : 'SAVED'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleHide(id)}
                        className="text-gray-400 hover:text-[var(--color-primary)] transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                        title={isHidden ? "보이기" : "가리기"}
                      >
                        {isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      {activeTab === 'PERSONAL' && (
                        <button 
                          onClick={() => removePersonalVerse(`${verse.bookId}_${verse.chap}_${verse.vers}`)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2 text-lg">
                      <BookOpen size={18} className="text-[var(--color-secondary)]" />
                      {refText}
                    </h4>
                    <p className={cn(
                      "text-gray-700 leading-relaxed bible-text text-lg transition-all duration-500",
                      isHidden ? "blur-xl select-none opacity-10 scale-95" : "opacity-100"
                    )}>
                      {verse.text}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 text-[var(--color-secondary)]">
                      <Flame size={14} fill="currentColor" />
                      <span className="text-xs font-bold">1일차</span>
                    </div>
                    <button className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                      학습하기 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {(activeTab === 'HANDBOOK' ? filteredHandbook : filteredPersonal).length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 text-center">
              <Brain size={64} className="mb-4 opacity-10" />
              <h3 className="text-xl font-bold text-gray-300">말씀을 찾을 수 없습니다</h3>
              <p className="text-sm mt-2">검색어를 변경하거나 다른 카테고리를 선택해보세요.</p>
              {activeTab === 'PERSONAL' && (
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('gbp_switch_tab', { detail: 'READING' }))}
                  className="mt-6 px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold shadow-lg"
                >
                  성경 읽으러 가기
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
