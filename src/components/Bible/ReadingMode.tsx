import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Columns, LayoutList, Share2, Heart, MessageSquare } from 'lucide-react';
import { BOOKS, BIBLE_VERSIONS, MOCK_BIBLE_DATA } from '../../data/mockData';
import { cn } from '../../lib/utils';

export default function ReadingMode() {
  const [selectedBook, setSelectedBook] = useState('GEN');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [activeVersions, setActiveVersions] = useState(['KRV']); // Default to Korean
  const [showCommentary, setShowCommentary] = useState(false);

  const toggleVersion = (id: string) => {
    setActiveVersions(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(v => v !== id) : prev) 
        : (prev.length < 3 ? [...prev, id] : [prev[1], prev[2], id])
    );
  };

  const currentVerses = (versionId: string) => {
    return MOCK_BIBLE_DATA[versionId]?.[selectedBook]?.[selectedChapter] || [];
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Controls */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select 
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="bg-gray-100 px-4 py-2 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 ring-[var(--color-secondary)]"
          >
            {BOOKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex items-center bg-gray-100 rounded-xl px-2">
            <button onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))} className="p-2"><ChevronLeft size={16}/></button>
            <span className="px-2 font-bold">{selectedChapter}장</span>
            <button onClick={() => setSelectedChapter(selectedChapter + 1)} className="p-2"><ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
          {BIBLE_VERSIONS.map(v => (
            <button
              key={v.id}
              onClick={() => toggleVersion(v.id)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeVersions.includes(v.id) 
                  ? "bg-white text-[var(--color-primary)] shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bible Content */}
      <div className="flex-1 overflow-x-auto">
        <div className={cn(
          "parallel-container p-6 md:p-12 min-w-full",
          activeVersions.length === 1 ? "parallel-1" : activeVersions.length === 2 ? "parallel-2" : "parallel-3"
        )}>
          {activeVersions.map(versionId => (
            <div key={versionId} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--color-secondary)]">
                  {BIBLE_VERSIONS.find(v => v.id === versionId)?.name}
                </span>
              </div>
              
              <div className="space-y-8">
                {currentVerses(versionId).map((v: any) => (
                  <div key={v.v} className="group relative">
                    <div className="flex gap-4">
                      <span className="text-xs font-bold text-[var(--color-secondary)] mt-1.5 shrink-0 w-4 text-right">
                        {v.v}
                      </span>
                      <p 
                        className={cn(
                          "bible-text text-lg md:text-xl leading-[2] text-gray-800",
                          versionId === 'JOU' ? "japanese-content" : ""
                        )}
                        dangerouslySetInnerHTML={versionId === 'JOU' ? { __html: v.t } : undefined}
                      >
                        {versionId !== 'JOU' ? v.t : null}
                      </p>
                    </div>
                    
                    {/* Verse Actions (Hover) */}
                    <div className="absolute -right-2 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-full border p-1 shadow-sm">
                      <button className="p-2 hover:text-[var(--color-secondary)]"><Heart size={14}/></button>
                      <button className="p-2 hover:text-[var(--color-secondary)]" onClick={() => setShowCommentary(true)}><MessageSquare size={14}/></button>
                      <button className="p-2 hover:text-[var(--color-secondary)]"><Share2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commentary Overlay (Simple for now) */}
      {showCommentary && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l shadow-2xl z-50 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold premium-heading text-xl">성경 주석</h3>
              <button onClick={() => setShowCommentary(false)}><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <span className="text-[var(--color-secondary)] font-bold text-sm tracking-widest uppercase">Matthew Henry</span>
                <p className="text-gray-600 leading-relaxed text-sm">
                  태초에 하나님이 천지를 창조하시니라. 이 말씀은 모든 만물의 시작이 하나님께 있음을 선포합니다... (샘플 주석 내용)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return <LayoutList size={size} />; // Placeholder for close button
}
