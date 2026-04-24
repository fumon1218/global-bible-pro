import React, { useState, useEffect } from 'react';
import { Flame, Heart, Play, Brain, Settings as SettingsIcon, Trash2, Eye, EyeOff } from 'lucide-react';
import { BOOKS } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface SavedVerseData {
  bookId: string;
  chap: number;
  vers: number;
  text: string;
}

export default function MemoryMode() {
  const [activeTab, setActiveTab] = useState<'LIST' | 'STUDY' | 'QUIZ'>('LIST');
  const [savedVerses, setSavedVerses] = useState<SavedVerseData[]>([]);
  const [hiddenText, setHiddenText] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const keys = JSON.parse(localStorage.getItem('gbp_saved_verses') || '[]');
    const data: SavedVerseData[] = keys.map((k: string) => {
      const item = localStorage.getItem(`gbp_verse_data_${k}`);
      return item ? JSON.parse(item) : null;
    }).filter(Boolean);
    setSavedVerses(data);
  }, []);

  const removeVerse = (key: string) => {
    const keys = JSON.parse(localStorage.getItem('gbp_saved_verses') || '[]');
    const newKeys = keys.filter((k: string) => k !== key);
    localStorage.setItem('gbp_saved_verses', JSON.stringify(newKeys));
    localStorage.removeItem(`gbp_verse_data_${key}`);
    setSavedVerses(prev => prev.filter(v => `${v.bookId}_${v.chap}_${v.vers}` !== key));
  };

  const toggleHide = (key: string) => {
    setHiddenText(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getBookName = (id: string) => BOOKS.find(b => b.id === id)?.name || id;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold premium-heading mb-2">성경 암송 수첩</h2>
          <p className="text-gray-400">말씀을 마음속에 깊이 새기는 시간입니다.</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl shadow-xl">
          <Flame size={20} className="text-[var(--color-secondary)]" fill="currentColor" />
          <span className="font-bold">{savedVerses.length}개의 말씀 암송 중</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('LIST')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'LIST' ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-400")}
        >
          목록
        </button>
        <button 
          onClick={() => setActiveTab('STUDY')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'STUDY' ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-400")}
        >
          학습
        </button>
        <button 
          onClick={() => setActiveTab('QUIZ')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'QUIZ' ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-400")}
        >
          퀴즈
        </button>
      </div>

      {activeTab === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVerses.length > 0 ? (
            savedVerses.map((v) => {
              const key = `${v.bookId}_${v.chap}_${v.vers}`;
              return (
                <div key={key} className="card-premium p-8 space-y-6 group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-[var(--color-secondary)] tracking-widest uppercase">
                      {getBookName(v.bookId)}
                    </span>
                    <button 
                      onClick={() => removeVerse(key)}
                      className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="relative">
                    <p className={cn(
                      "bible-text text-xl leading-relaxed transition-all duration-500",
                      hiddenText[key] ? "blur-md select-none opacity-20" : "text-gray-800"
                    )}>
                      "{v.text}"
                    </p>
                    {hiddenText[key] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Brain size={32} className="text-gray-300 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs font-bold text-gray-400">{getBookName(v.bookId)} {v.chap}:{v.vers}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleHide(key)}
                        className="p-2 text-gray-400 hover:text-[var(--color-secondary)] transition-colors"
                      >
                        {hiddenText[key] ? <Eye size={18}/> : <EyeOff size={18}/>}
                      </button>
                      <button className="p-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                        <Play size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <Heart size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-medium">아직 저장된 말씀이 없습니다.</p>
              <p className="text-xs text-gray-300 mt-2">성경 읽기 모드에서 하트 아이콘을 눌러보세요.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'STUDY' && (
        <div className="text-center py-20">
          <Brain size={64} className="mx-auto mb-6 text-[var(--color-secondary)] opacity-20" />
          <h3 className="text-2xl font-bold mb-4">학습 모드 준비 중</h3>
          <p className="text-gray-400">저장된 말씀을 체계적으로 외울 수 있는 학습 시스템이 곧 추가됩니다.</p>
        </div>
      )}

      {activeTab === 'QUIZ' && (
        <div className="text-center py-20">
          <SettingsIcon size={64} className="mx-auto mb-6 text-[var(--color-secondary)] opacity-20 animate-spin-slow" />
          <h3 className="text-2xl font-bold mb-4">퀴즈 모드 준비 중</h3>
          <p className="text-gray-400">암송 실력을 점검할 수 있는 다양한 퀴즈가 준비되고 있습니다.</p>
        </div>
      )}
    </div>
  );
}

