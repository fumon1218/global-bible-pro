import React, { useState, useEffect } from 'react';
import { X, Heart, Edit3, Highlighter, Trash2, Download, ExternalLink, Loader2, ChevronRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { BOOKS } from '../../data/mockData';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (bookId: string, chapter: number, verse: number) => void;
}

export default function UserDashboard({ isOpen, onClose, onNavigate }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'highlights' | 'notes' | 'saved'>('notes');
  const [highlights, setHighlights] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [savedVerses, setSavedVerses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    
    // Fetch highlights
    const qH = query(collection(db, "highlights"), orderBy("updatedAt", "desc"));
    const unsubH = onSnapshot(qH, (snap) => {
      setHighlights(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch notes
    const qN = query(collection(db, "notes"), orderBy("updatedAt", "desc"));
    const unsubN = onSnapshot(qN, (snap) => {
      setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Load saved verses from localStorage
    const savedKeys = JSON.parse(localStorage.getItem('gbp_saved_verses') || '[]');
    const savedData = savedKeys.map((key: string) => {
      return JSON.parse(localStorage.getItem(`gbp_verse_data_${key}`) || '{}');
    }).filter((d: any) => d.bookId);
    setSavedVerses(savedData);

    setIsLoading(false);

    return () => {
      unsubH();
      unsubN();
    };
  }, [isOpen]);

  const handleDeleteAll = async (type: string) => {
    if (!confirm(`모든 ${type === 'notes' ? '메모' : '하이라이트'}를 삭제하시겠습니까?`)) return;
    
    const items = type === 'notes' ? notes : highlights;
    for (const item of items) {
      await deleteDoc(doc(db, type, item.id));
    }
  };

  const handleExport = () => {
    const data = {
      notes,
      highlights,
      savedVerses,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible_backup_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-end">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-white relative z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 premium-heading">마이 페이지</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium italic">나의 신앙 기록을 관리합니다</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              className="p-2.5 bg-gray-50 text-gray-400 hover:text-[var(--color-secondary)] hover:bg-white border border-gray-100 rounded-xl transition-all shadow-sm"
              title="백업하기"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 flex gap-2 border-b bg-gray-50/30">
          {[
            { id: 'notes', label: '나의 메모', icon: Edit3, count: notes.length },
            { id: 'highlights', label: '하이라이트', icon: Highlighter, count: highlights.length },
            { id: 'saved', label: '저장된 구절', icon: Heart, count: savedVerses.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all",
                activeTab === tab.id 
                  ? "bg-white text-[var(--color-secondary)] shadow-md ring-1 ring-gray-100" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-400">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-300">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold">기록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'notes' && (
                notes.length > 0 ? (
                  notes.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--color-secondary)] group-hover:bg-[var(--color-secondary)] group-hover:text-white transition-all">
                            <Edit3 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.bookName} {item.chapter}:{item.verse}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              {item.updatedAt?.toDate().toLocaleDateString() || '방금 전'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onNavigate(item.bookId, item.chapter, item.verse)}
                          className="p-2 text-gray-300 hover:text-[var(--color-secondary)] hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50/50 p-4 rounded-2xl border border-dotted border-gray-200">
                        {item.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyState message="아직 작성된 메모가 없습니다." />
                )
              )}

              {activeTab === 'highlights' && (
                highlights.length > 0 ? (
                  highlights.map(item => {
                    const book = BOOKS.find(b => b.id === item.bookId);
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-all"
                        onClick={() => onNavigate(item.bookId, item.chapter, item.verse)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-3 h-3 rounded-full", 
                            item.color === 'yellow' ? 'bg-yellow-200' : 
                            item.color === 'green' ? 'bg-green-200' : 
                            item.color === 'blue' ? 'bg-blue-200' : 'bg-pink-200'
                          )} />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{book?.name} {item.chapter}:{item.verse}</p>
                            <p className="text-[10px] text-gray-400 font-bold">Verse {item.verse}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-300" size={16} />
                      </div>
                    );
                  })
                ) : (
                  <EmptyState message="하이라이트 표시된 구절이 없습니다." />
                )
              )}

              {activeTab === 'saved' && (
                savedVerses.length > 0 ? (
                  savedVerses.map(item => (
                    <div 
                      key={`${item.bookId}_${item.chap}_${item.vers}`}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                      onClick={() => onNavigate(item.bookId, item.chap, item.vers)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-full uppercase tracking-widest">Saved</span>
                        <div className="flex items-center gap-1 text-gray-300 font-bold text-xs">
                           {BOOKS.find(b => b.id === item.bookId)?.name} {item.chap}:{item.vers}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 italic" dangerouslySetInnerHTML={{ __html: item.text }} />
                    </div>
                  ))
                ) : (
                  <EmptyState message="저장된 구절이 없습니다." />
                )
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50/50 flex items-center justify-center gap-6">
           <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Global Bible Pro Content Manager</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-4 text-gray-300">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <StickyNote size={24} />
      </div>
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}

function StickyNote({ size, className }: { size: number, className?: string }) {
  return <div className={className}><Edit3 size={size} /></div>;
}
