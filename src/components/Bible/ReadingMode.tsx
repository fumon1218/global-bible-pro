import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Columns, LayoutList, Share2, Heart, MessageSquare, X, Loader2, Search as SearchIcon } from 'lucide-react';
import { BOOKS, BIBLE_VERSIONS } from '../../data/mockData';
import BibleSearch from './BibleSearch';
import { cn } from '../../lib/utils';

interface Verse {
  v: number;
  t: string;
}

export default function ReadingMode() {
  const [selectedBook, setSelectedBook] = useState('GEN');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [activeVersions, setActiveVersions] = useState(['KRV']);
  const [showCommentary, setShowCommentary] = useState(false);
  const [loadedData, setLoadedData] = useState<Record<string, any>>({});
  const [commentaryData, setCommentaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [savedVerses, setSavedVerses] = useState<string[]>([]);

  // Load saved verses
  useEffect(() => {
    const saved = localStorage.getItem('gbp_saved_verses');
    if (saved) setSavedVerses(JSON.parse(saved));
  }, []);

  const toggleSaveVerse = (bookId: string, chap: number, vers: number, text: string) => {
    const verseKey = `${bookId}_${chap}_${vers}`;
    let newSaved = [...savedVerses];
    
    if (savedVerses.includes(verseKey)) {
      newSaved = savedVerses.filter(k => k !== verseKey);
      // Also remove the full data
      localStorage.removeItem(`gbp_verse_data_${verseKey}`);
    } else {
      newSaved.push(verseKey);
      // Store the text for memory mode
      localStorage.setItem(`gbp_verse_data_${verseKey}`, JSON.stringify({ bookId, chap, vers, text }));
    }
    
    setSavedVerses(newSaved);
    localStorage.setItem('gbp_saved_verses', JSON.stringify(newSaved));
  };

  const handleShare = async (verse: Verse) => {
    const book = BOOKS.find(b => b.id === selectedBook);
    // Strip HTML tags for clean sharing
    const cleanText = verse.t.replace(/<[^>]*>?/gm, '');
    const text = `${book?.name} ${selectedChapter}:${verse.v}\n\n${cleanText}\n\n- Global Bible Pro`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '성경 말씀 공유',
          text: text,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('클립보드에 복사되었습니다.');
      } catch (error) {
        alert('공유 기능을 사용할 수 없습니다.');
      }
    }
  };

  // Fetch Bible Data
  useEffect(() => {
    const fetchBibleData = async () => {
      const versionsToFetch = activeVersions.filter(v => !loadedData[v]);
      if (versionsToFetch.length === 0) return;

      setIsLoading(true);
      try {
        for (const vId of versionsToFetch) {
          const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
            ? import.meta.env.BASE_URL 
            : `${import.meta.env.BASE_URL}/`;
          const response = await fetch(`${baseUrl}data/bible/${vId.toLowerCase()}.json`);
          if (response.ok) {
            const data = await response.json();
            setLoadedData(prev => ({ ...prev, [vId]: data }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch Bible data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibleData();
  }, [activeVersions]);

  // Handle global navigation (from search)
  useEffect(() => {
    const handleNavigate = () => {
      const lastRef = localStorage.getItem('gbp_last_ref');
      if (lastRef) {
        const { b, c, v } = JSON.parse(lastRef);
        setSelectedBook(b);
        setSelectedChapter(c);
        setTimeout(() => {
          const element = document.getElementById(`verse-${v}`);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    };

    window.addEventListener('gbp_navigate', handleNavigate);
    return () => window.removeEventListener('gbp_navigate', handleNavigate);
  }, []);

  // Fetch Commentary Data
  useEffect(() => {
    const fetchCommentary = async () => {
      if (!showCommentary) return;

      const book = BOOKS.find(b => b.id === selectedBook);
      if (!book) return;

      setIsCommentaryLoading(true);
      try {
        // HelloAO API uses the same numeric book ID (1-66)
        const response = await fetch(`https://bible.helloao.org/api/c/matthew-henry/${book.jsonId}/${selectedChapter}.json`);
        if (response.ok) {
          setCommentaryData(await response.json());
        } else {
          setCommentaryData(null);
        }
      } catch (error) {
        console.error("Failed to fetch commentary:", error);
        setCommentaryData(null);
      } finally {
        setIsCommentaryLoading(false);
      }
    };

    fetchCommentary();
  }, [showCommentary, selectedBook, selectedChapter]);

  const toggleVersion = (id: string) => {
    setActiveVersions(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(v => v !== id) : prev) 
        : (prev.length < 3 ? [...prev, id] : [prev[1], prev[2], id])
    );
  };

  const currentVerses = (versionId: string): Verse[] => {
    const data = loadedData[versionId];
    if (!data) return [];
    
    const book = BOOKS.find(b => b.id === selectedBook);
    if (!book) return [];

    const chapterData = data.book[book.jsonId]?.chapter[selectedChapter.toString()];
    if (!chapterData) return [];

    return Object.entries(chapterData.verse).map(([v, content]: [string, any]) => ({
      v: parseInt(v),
      t: content.text
    })).sort((a, b) => a.v - b.v);
  };

  const currentBook = BOOKS.find(b => b.id === selectedBook);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Controls - Fixed height for better sticky alignment */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4 min-h-[72px]">
        <div className="flex items-center gap-4">
          <select 
            value={selectedBook}
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapter(1);
            }}
            className="bg-gray-100 px-4 py-2 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 ring-[var(--color-secondary)] transition-all"
          >
            {BOOKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex items-center bg-gray-100 rounded-xl px-2">
            <button 
              onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))} 
              disabled={selectedChapter <= 1}
              className="p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16}/>
            </button>
            <span className="px-2 font-bold min-w-[3rem] text-center">{selectedChapter}장</span>
            <button 
              onClick={() => setSelectedChapter(Math.min(currentBook?.chapters || 1, selectedChapter + 1))} 
              disabled={selectedChapter >= (currentBook?.chapters || 1)}
              className="p-2 disabled:opacity-30"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-600"
            title="검색"
          >
            <SearchIcon size={20} />
          </button>
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
      </div>

      {/* Bible Content */}
      <div className="flex-1 overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
            <Loader2 className="animate-spin text-[var(--color-secondary)]" size={32} />
          </div>
        )}
        
        <div className={cn(
          "parallel-container p-6 md:p-12 min-w-full",
          activeVersions.length === 1 ? "pb-24" : ""
        )}
        style={{
          gridTemplateColumns: `repeat(${activeVersions.length}, minmax(300px, 1fr))`
        }}>
          {activeVersions.map(versionId => (
            <div key={`${versionId}-${selectedBook}-${selectedChapter}`} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border-r last:border-r-0 border-gray-100 pr-4">
              <div className="flex items-center justify-between sticky top-[72px] md:top-[80px] bg-white/95 py-3 z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] px-2 -mx-2">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--color-secondary)] px-2 bg-gray-50 rounded">
                  {BIBLE_VERSIONS.find(v => v.id === versionId)?.name}
                </span>
              </div>
              
              <div className="space-y-8">
                {currentVerses(versionId).length > 0 ? (
                  currentVerses(versionId).map((v) => (
                    <div key={v.v} id={`verse-${v.v}`} className="group relative">
                      <div className="flex gap-4">
                        <span className="text-xs font-bold text-[var(--color-secondary)] mt-1.5 shrink-0 w-6 text-right">
                          {v.v}
                        </span>
                        <p 
                          className={cn(
                            "bible-text text-lg md:text-xl leading-[2] text-gray-800",
                            versionId === 'JOU' ? "japanese-content" : ""
                          )}
                          dangerouslySetInnerHTML={{ __html: v.t }}
                        />
                      </div>
                      
                      {/* Verse Actions (Hover) */}
                      <div className="absolute -right-2 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-full border p-1 shadow-sm z-10">
                        <button 
                          className={cn(
                            "p-2 transition-colors",
                            savedVerses.includes(`${selectedBook}_${selectedChapter}_${v.v}`) 
                              ? "text-red-500 hover:text-red-600" 
                              : "text-gray-400 hover:text-[var(--color-secondary)]"
                          )}
                          onClick={() => toggleSaveVerse(selectedBook, selectedChapter, v.v, v.t)}
                        >
                          <Heart size={14} fill={savedVerses.includes(`${selectedBook}_${selectedChapter}_${v.v}`) ? "currentColor" : "none"}/>
                        </button>
                        <button className="p-2 hover:text-[var(--color-secondary)]" onClick={() => setShowCommentary(true)}><MessageSquare size={14}/></button>
                        <button className="p-2 hover:text-[var(--color-secondary)]" onClick={() => handleShare(v)}><Share2 size={14}/></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-gray-400 text-sm flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-gray-200" size={24} />
                    <span>{loadedData[versionId] ? "본문을 구성하는 중..." : "말씀을 불러오는 중..."}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setShowSearch(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full md:w-[400px] bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-bold premium-heading text-xl">말씀 검색</h3>
                <button 
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <BibleSearch 
                  activeVersion={activeVersions[0]} 
                  onSelectResult={(bookId, chap, vers) => {
                    setSelectedBook(bookId);
                    setSelectedChapter(chap);
                    setShowSearch(false);
                    // Optionally scroll to verse
                    setTimeout(() => {
                      const element = document.getElementById(`verse-${vers}`);
                      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Commentary Overlay */}
      {showCommentary && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[500px] bg-white border-l shadow-2xl z-50 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold premium-heading text-xl">성경 주석</h3>
                <p className="text-xs text-gray-400 mt-1">{currentBook?.name} {selectedChapter}장</p>
              </div>
              <button 
                onClick={() => setShowCommentary(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {isCommentaryLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                  <Loader2 className="animate-spin" size={24} />
                  <p className="text-sm">매튜 헨리 주석을 불러오는 중...</p>
                </div>
              ) : commentaryData ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <span className="text-[var(--color-secondary)] font-black text-[10px] tracking-[0.2em] uppercase">Matthew Henry</span>
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </div>
                  
                  <div className="space-y-8">
                    {commentaryData.commentary?.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-3">
                        {item.verses && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded text-gray-500">
                            Verses {item.verses}
                          </span>
                        )}
                        <div 
                          className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      </div>
                    ))}
                    {!commentaryData.commentary && (
                      <p className="text-gray-500 text-sm italic text-center py-12">주석 내용이 없습니다.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-sm">해당 장의 주석을 불러올 수 없습니다.</p>
                  <button 
                    onClick={() => setShowCommentary(false)}
                    className="mt-4 text-[var(--color-secondary)] font-bold text-sm underline underline-offset-4"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 text-[10px] text-gray-400 border-t">
              Data provided by HelloAO API & Matthew Henry Commentary.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

