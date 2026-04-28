import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Columns, LayoutList, Share2, Heart, MessageSquare, X, Loader2, Search as SearchIcon, Play, Pause, Square, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BOOKS, BIBLE_VERSIONS } from '../../data/mockData';
import BibleSearch from './BibleSearch';
import BibleSelector from './BibleSelector';
import BibleSettings from './BibleSettings';
import NoteEditor from './NoteEditor';
import UserDashboard from './UserDashboard';
import ReadingPlan from './ReadingPlan';
import VersionSelector from './VersionSelector';
import ReadingProgress from './ReadingProgress';
import { Type, Edit3, StickyNote, User, Calendar, Menu as MenuIcon, BookOpen, Headphones, Settings, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db, auth } from '../../lib/firebase';
import { db as localDb } from '../../lib/db';
import { useReading } from '../../contexts/ReadingContext';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface Verse {
  v: number;
  t: string;
  highlight?: string;
  underline?: boolean;
}

interface ReadingModeProps {
  onOpenSidebar?: () => void;
}

export default function ReadingMode({ onOpenSidebar }: ReadingModeProps) {
  const { t } = useTranslation();
  const { completedChapters, toggleChapter } = useReading();
  const [selectedBook, setSelectedBook] = useState('GEN');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [primaryVersion, setPrimaryVersion] = useState(() => localStorage.getItem('gbp_primary_version') || 'NKRV');
  const [parallelVersion, setParallelVersion] = useState<string | null>(() => localStorage.getItem('gbp_parallel_version') || null);
  const [showCommentary, setShowCommentary] = useState(false);
  const [loadedData, setLoadedData] = useState<Record<string, any>>({});
  const [commentaryData, setCommentaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [savedVerses, setSavedVerses] = useState<string[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Record<string, { color: string, underline: boolean }>>({});
  const [notes, setNotes] = useState<Record<string, boolean>>({});
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isVersionSelectorOpen, setIsVersionSelectorOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [readingVerse, setReadingVerse] = useState<number | null>(null);

  // Appearance States
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('gbp_font_size')) || 18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>(() => (localStorage.getItem('gbp_theme') as any) || 'light');
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem('gbp_line_height')) || 1.7);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>(() => (localStorage.getItem('gbp_font_family') as any) || 'sans');

  // Memoized color map
  const COLORS = [
    { id: 'yellow', bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-400' },
    { id: 'green', bg: 'bg-green-200', text: 'text-green-900', border: 'border-green-400' },
    { id: 'blue', bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-400' },
    { id: 'pink', bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-400' },
  ];

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 70;

  // Reading Logs for today
  const [todayLogCount, setTodayLogCount] = useState(0);

  // Persistence of settings
  useEffect(() => {
    localStorage.setItem('gbp_font_size', fontSize.toString());
    localStorage.setItem('gbp_theme', theme);
    localStorage.setItem('gbp_line_height', lineHeight.toString());
    localStorage.setItem('gbp_font_family', fontFamily);
    localStorage.setItem('gbp_primary_version', primaryVersion);
    if (parallelVersion) localStorage.setItem('gbp_parallel_version', parallelVersion);
    else localStorage.removeItem('gbp_parallel_version');
  }, [fontSize, theme, lineHeight, fontFamily, primaryVersion, parallelVersion]);

  // Load today's log count
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}');
    const today = new Date().toISOString().split('T')[0];
    setTodayLogCount(logs[today] || 0);
  }, [selectedChapter]);

  // Load initial data and saved position
  useEffect(() => {
    const saved = localStorage.getItem('gbp_saved_verses');
    if (saved) setSavedVerses(JSON.parse(saved));

    const gbp_last_ref = localStorage.getItem('gbp_last_ref');
    if (gbp_last_ref) {
      const { b, c } = JSON.parse(gbp_last_ref);
      setSelectedBook(b);
      setSelectedChapter(c);
    }
  }, []);

  const toggleSaveVerse = (bookId: string, chap: number, vers: number, text: string) => {
    const verseKey = `${bookId}_${chap}_${vers}`;
    let newSaved = [...savedVerses];
    
    if (savedVerses.includes(verseKey)) {
      newSaved = savedVerses.filter(k => k !== verseKey);
      localStorage.removeItem(`gbp_verse_data_${verseKey}`);
    } else {
      newSaved.push(verseKey);
      localStorage.setItem(`gbp_verse_data_${verseKey}`, JSON.stringify({ bookId, chap, vers, text }));
    }
    
    setSavedVerses(newSaved);
    localStorage.setItem('gbp_saved_verses', JSON.stringify(newSaved));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentBookInfo = BOOKS.find(b => b.id === selectedBook);
    
    if (isLeftSwipe) {
      if (selectedChapter < (currentBookInfo?.chapters || 1)) {
        setSelectedChapter(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (isRightSwipe) {
      if (selectedChapter > 1) {
        setSelectedChapter(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleCheckAndNext = async () => {
    const key = `${selectedBook}_${selectedChapter}`;
    
    if (!completedChapters[key]) {
      await toggleChapter(selectedBook, selectedChapter);
    }

    const currentBookInfo = BOOKS.find(b => b.id === selectedBook);
    if (selectedChapter < (currentBookInfo?.chapters || 1)) {
      setSelectedChapter(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const bookIdx = BOOKS.findIndex(b => b.id === selectedBook);
      if (bookIdx < BOOKS.length - 1) {
        setSelectedBook(BOOKS[bookIdx + 1].id);
        setSelectedChapter(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('성경 모든 권의 끝에 도달했습니다. 수고하셨습니다!');
      }
    }
  };

  const handleShare = async (verse: Verse) => {
    const book = BOOKS.find(b => b.id === selectedBook);
    const cleanText = verse.t.replace(/<[^>]*>?/gm, '');
    const text = `${book?.name} ${selectedChapter}:${verse.v}\n\n${cleanText}\n\n- Global Bible Pro`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: '성경 말씀 공유', text });
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

  // Fetch Bible Data with improved error handling and retry
  useEffect(() => {
    const fetchBibleData = async () => {
      const versionsToFetch = [primaryVersion, parallelVersion].filter(v => v && !loadedData[v]) as string[];
      if (versionsToFetch.length === 0) return;

      setIsLoading(true);
      try {
        for (const vId of versionsToFetch) {
          try {
            // 1. Try Local DB first
            const cached = await (localDb as any).versions.get(vId);
            if (cached) {
              // Validate cache structure to prevent blank space errors from broken json
              if (cached.data?.book?.['1']?.chapter?.['1']?.verse) {
                setLoadedData(prev => ({ ...prev, [vId]: cached.data }));
                continue;
              } else {
                console.warn(`Invalid cache detected for ${vId}, clearing and refetching...`);
                await (localDb as any).versions.delete(vId);
              }
            }

            // 2. Fetch from network with retry
            const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
            const fileName = vId.toLowerCase() === 'krv' ? 'krv_fixed_v3' : vId.toLowerCase();
            let response = await fetch(`${baseUrl}data/bible/${fileName}.json?t=${Date.now()}`);
            
            if (!response.ok) {
              // Simple retry logic
              console.warn(`Initial fetch failed for ${vId}, retrying...`);
              response = await fetch(`${baseUrl}data/bible/${vId.toLowerCase()}.json?t=${Date.now()}`);
            }

            if (response.ok) {
              const data = await response.json();
              await (localDb as any).versions.put({ id: vId, data, updatedAt: Date.now() });
              setLoadedData(prev => ({ ...prev, [vId]: data }));
            } else {
              throw new Error(`Failed to load ${vId}`);
            }
          } catch (itemError) {
            console.error(`Error loading version ${vId}:`, itemError);
            // If primary version fails, we might want to fallback to KRV if available
            if (vId === primaryVersion && vId !== 'KRV') {
               console.warn("Falling back to KRV due to primary version load failure");
               setPrimaryVersion('KRV');
            }
          }
        }
      } catch (error) {
        console.error("Critical error in Bible data fetching:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibleData();
  }, [primaryVersion, parallelVersion]);

  // Global navigation listener
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

  // Fetch Commentary
  useEffect(() => {
    const fetchCommentary = async () => {
      if (!showCommentary) return;
      setIsCommentaryLoading(true);
      try {
        const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
        const response = await fetch(`${baseUrl}data/bible/chokmah.json?t=${Date.now()}`);
        if (response.ok) {
          const allData = await response.json();
          const book = BOOKS.find(b => b.id === selectedBook);
          if (book) {
            const chapData = allData.book[book.jsonId]?.chapter[selectedChapter.toString()];
            if (chapData) {
              const formatted = Object.entries(chapData.verse).map(([v, content]: [string, any]) => ({
                verses: v,
                content: content.text
              }));
              setCommentaryData({ commentary: formatted });
            } else {
              setCommentaryData(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch commentary:", error);
      } finally {
        setIsCommentaryLoading(false);
      }
    };
    fetchCommentary();
  }, [showCommentary, selectedBook, selectedChapter]);

  // Highlights & Notes from Firestore
  useEffect(() => {
    const fetchHighlights = async () => {
      const q = query(
        collection(db, "highlights"),
        where("bookId", "==", selectedBook),
        where("chapter", "==", selectedChapter)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newHighlights: any = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          newHighlights[data.verse] = { color: data.color, underline: data.underline };
        });
        setHighlights(newHighlights);
      });
      return () => unsubscribe();
    };
    fetchHighlights();
    
    const fetchNotes = async () => {
      const q = query(
        collection(db, "notes"),
        where("bookId", "==", selectedBook),
        where("chapter", "==", selectedChapter)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotes: any = {};
        snapshot.docs.forEach(doc => { newNotes[doc.data().verse] = true; });
        setNotes(newNotes);
      });
      return unsubscribe;
    };
    const unsubscribeNotes = fetchNotes();

    if (selectedBook && selectedChapter) {
      localStorage.setItem('gbp_last_ref', JSON.stringify({ b: selectedBook, c: selectedChapter, time: Date.now() }));
    }
  }, [selectedBook, selectedChapter]);

  const toggleHighlight = async (verseNum: number, colorId: string | null) => {
    const docId = `h_${selectedBook}_${selectedChapter}_${verseNum}`;
    const docRef = doc(db, "highlights", docId);
    if (!colorId && !highlights[verseNum]?.underline) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, {
        bookId: selectedBook, chapter: selectedChapter, verse: verseNum,
        color: colorId || highlights[verseNum]?.color || 'yellow',
        underline: highlights[verseNum]?.underline || false,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const toggleUnderline = async (verseNum: number) => {
    const docId = `h_${selectedBook}_${selectedChapter}_${verseNum}`;
    const docRef = doc(db, "highlights", docId);
    await setDoc(docRef, {
      bookId: selectedBook, chapter: selectedChapter, verse: verseNum,
      color: highlights[verseNum]?.color || 'yellow',
      underline: !highlights[verseNum]?.underline,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const currentVerses = (versionId: string): Verse[] => {
    const data = loadedData[versionId];
    if (!data) return [];
    const book = BOOKS.find(b => b.id === selectedBook);
    const chapterData = data.book[book?.jsonId || '']?.chapter[selectedChapter.toString()];
    if (!chapterData) return [];
    
    let verses = Object.entries(chapterData.verse).map(([v, content]: [string, any]) => ({
      v: parseInt(v), t: content.text
    }));

    // [최종 병기] 히브리서 11:1 강제 보정 로직
    if (versionId === 'KRV' && selectedBook === 'HEB' && selectedChapter === 11) {
      const v1 = verses.find(v => v.v === 1);
      const v2 = verses.find(v => v.v === 2);
      // 1절이 비어있고 2절에 1절 내용이 들어가 있다면 강제로 밀어줌
      if ((!v1 || !v1.t.trim()) && v2 && (v2.t.includes('믿음은 바라는 것들의 실상') || v2.t.includes('선진들이 이로써'))) {
        return verses.map(v => {
          if (v.v === 1) return { ...v, t: '믿음은 바라는 것들의 실상이요 보지 못하는 것들의 증거니' };
          if (v.v === 2) return { ...v, t: '선진들이 이로써 증거를 얻었느니라' };
          return v;
        }).sort((a, b) => a.v - b.v);
      }
    }

    return verses.sort((a, b) => a.v - b.v);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setReadingVerse(null);
      return;
    }

    const verses = currentVerses(primaryVersion);
    if (verses.length === 0) return;

    setIsPlaying(true);
    let currentIndex = 0;

    const speak = (index: number) => {
      if (index >= verses.length) {
        setIsPlaying(false);
        setReadingVerse(null);
        return;
      }

      const verse = verses[index];
      const cleanText = verse.t.replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Try to find high quality Korean voice
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang.includes('ko') && (v.name.includes('Premium') || v.name.includes('Yuna') || v.name.includes('Google')));
      if (koVoice) utterance.voice = koVoice;
      
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // Slightly slower for better meditation
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setReadingVerse(verse.v);
        const element = document.getElementById(`verse-${verse.v}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      utterance.onend = () => {
        if (window.speechSynthesis.speaking || isPlaying) {
          speak(index + 1);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setReadingVerse(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speak(0);
  };

  const currentBook = BOOKS.find(b => b.id === selectedBook);
  const themeClasses = { light: "bg-white text-gray-800", sepia: "bg-[#f4ecd8] text-[#5b4636]", dark: "bg-[#1a1a1a] text-gray-300" };
  const todayStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div 
      className={cn("flex flex-col h-full relative transition-colors duration-500", themeClasses[theme])}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Controls - Unified sticky header */}
      <div className={cn(
        "sticky top-0 z-[60] border-b px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors",
        theme === 'dark' ? "bg-[#1a1a1a] border-gray-800" : (theme === 'sepia' ? "bg-[#f4ecd8] border-[#d3c1a3]" : "bg-white border-gray-100")
      )}>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onOpenSidebar}
            className="p-2 -ml-2 text-gray-500 hover:text-indigo-600 transition-colors md:hidden"
          >
             <MenuIcon size={24} />
          </button>

          <button 
            onClick={() => setIsSelectorOpen(true)}
            className="flex items-center gap-2 md:gap-3 bg-gray-50 hover:bg-gray-100 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl border border-gray-100 transition-all group"
          >
            <div className="flex flex-col items-start leading-none gap-1">
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentBook?.enName}</span>
              <span className="text-xs md:text-sm font-black text-gray-900">{currentBook?.name} {selectedChapter}장</span>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
              <ChevronRight size={14} />
            </div>
          </button>

          <button onClick={() => setIsVersionSelectorOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-2xl shadow-lg hover:bg-black transition-all">
            <div className="flex flex-col items-start leading-none gap-1">
              <span className="text-[9px] md:text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Version</span>
              <div className="flex items-center gap-1 md:gap-2">
                 <span className="text-xs md:text-sm font-black whitespace-nowrap">{BIBLE_VERSIONS.find(v => v.id === primaryVersion)?.name}</span>
                 {parallelVersion && (
                    <>
                       <div className="w-px h-2.5 md:h-3 bg-white/20" />
                       <span className="text-xs md:text-sm font-black text-indigo-400 whitespace-nowrap">{BIBLE_VERSIONS.find(v => v.id === parallelVersion)?.name}</span>
                    </>
                 )}
              </div>
            </div>
            <BookOpen size={14} className="hidden sm:block opacity-40" />
          </button>
        </div>

        {/* Premium Audio Controller */}
        <div className="flex items-center gap-3 bg-indigo-50/50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-inner group">
           <div className="flex items-center gap-3">
              <button 
                onClick={toggleAudio}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90",
                  isPlaying ? "bg-red-500 text-white animate-pulse" : "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
              </button>
              <div className="hidden sm:flex flex-col">
                 <span className={cn("text-[9px] font-black uppercase tracking-widest", isPlaying ? "text-red-500" : "text-indigo-600")}>
                   {isPlaying ? "Streaming Now" : "Audio Bible"}
                 </span>
                 <p className="text-[11px] font-bold text-slate-700">말씀 듣기</p>
              </div>
           </div>
           
           {isPlaying && (
              <div className="flex items-center gap-1 h-4 px-2">
                 {[1, 2, 3, 4, 5].map(i => (
                    <div 
                       key={i} 
                       className="w-0.5 bg-red-400 rounded-full animate-audio-bar" 
                       style={{ 
                          height: '100%', 
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: `${0.5 + Math.random()}s`
                       }} 
                    />
                 ))}
              </div>
           )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-600"><Type size={20} /></button>
          <button onClick={() => setShowSearch(true)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-600 hidden sm:block"><SearchIcon size={20} /></button>
          <div className="w-px h-6 bg-gray-200 mx-1 hidden lg:block" />
          <button onClick={() => setIsProgressOpen(true)} className="flex p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"><Calendar size={20} /></button>
          <button onClick={() => setIsDashboardOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95"><User size={20} /></button>
        </div>
      </div>

      {/* Bible Content */}
      <div className="relative flex-1 overflow-x-auto no-scrollbar">
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-20 pointer-events-none">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        )}
        
        <div className={cn("parallel-container p-6 md:p-12 min-w-full pt-10 md:pt-16", !parallelVersion ? "max-w-4xl mx-auto" : "")} style={{ gridTemplateColumns: parallelVersion ? `repeat(2, minmax(300px, 1fr))` : `1fr` }}>
          {[primaryVersion, parallelVersion].filter(Boolean).map((versionId: any) => (
            <div key={`${versionId}-${selectedBook}-${selectedChapter}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-r last:border-r-0 border-gray-100 pr-4">
              <div className="sticky top-[72px] bg-inherit z-10 py-4 mb-6 border-b border-gray-100 flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full">
                  {BIBLE_VERSIONS.find(v => v.id === versionId)?.name}
                </span>
              </div>
              
              <div className="space-y-4">
                {currentVerses(versionId).map((v) => (
                  <div key={v.v} id={`verse-${v.v}`} className={cn("group relative p-2 rounded-2xl transition-all duration-300", selectedVerse === v.v ? "bg-gray-50/80 ring-1 ring-gray-100" : (readingVerse === v.v ? "bg-indigo-50 ring-2 ring-indigo-200" : "hover:bg-gray-50/30"), highlights[v.v]?.color && COLORS.find(c => c.id === highlights[v.v].color)?.bg )} onClick={() => setSelectedVerse(selectedVerse === v.v ? null : v.v)}>
                    <div className="flex gap-4">
                      <span className={cn("text-xs font-bold mt-2 shrink-0 w-6 text-right", highlights[v.v]?.color ? "text-gray-600" : "text-indigo-400")}>{v.v}</span>
                      <div className="flex flex-col gap-2 flex-1">
                        <p className={cn("bible-text transition-all duration-300", highlights[v.v]?.underline ? "underline decoration-gray-400 decoration-2 underline-offset-4" : "", fontFamily === 'serif' ? 'font-serif' : 'font-sans' )} style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, color: theme === 'dark' ? '#d1d5db' : (theme === 'sepia' ? '#5b4636' : '#1f2937') }} dangerouslySetInnerHTML={{ __html: v.t }} />
                        {selectedVerse === v.v && (
                          <div className="flex flex-wrap items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300 z-20">
                            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-lg border border-gray-100">
                              {COLORS.map(color => (
                                <button key={color.id} onClick={(e) => { e.stopPropagation(); toggleHighlight(v.v, highlights[v.v]?.color === color.id ? null : color.id); }} className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", color.bg, highlights[v.v]?.color === color.id ? "border-slate-800 scale-110" : "border-transparent" )} />
                              ))}
                              <button onClick={(e) => { e.stopPropagation(); toggleUnderline(v.v); }} className={cn("px-3 py-1 rounded-lg text-xs font-bold border transition-colors", highlights[v.v]?.underline ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400" )}>U</button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); setIsNoteEditorOpen(true); }} className="p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-400 hover:text-indigo-600"><Edit3 size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare(v); }} className="p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-400 hover:text-indigo-600"><Share2 size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); setShowCommentary(true); }} className="p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-400 hover:text-indigo-600"><MessageSquare size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); toggleSaveVerse(selectedBook, selectedChapter, v.v, v.t); }} className="p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-400 hover:text-red-500"><Heart size={16} fill={savedVerses.includes(`${selectedBook}_${selectedChapter}_${v.v}`) ? "currentColor" : "none"} /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!isLoading && Object.keys(loadedData).length === 0) && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <X size={32} />
              </div>
              <div>
                <p className="font-bold text-lg">데이터를 불러올 수 없습니다.</p>
                <p className="text-gray-400 text-sm">네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all"
              >
                새로고침
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation Button */}
        <div className="mt-12 mb-32 flex flex-col items-center gap-4 max-w-lg mx-auto px-6">
           <button onClick={handleCheckAndNext} className="w-full py-4 px-8 bg-white border-2 border-indigo-600 text-indigo-600 rounded-full font-black text-lg hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"><CheckCircle2 size={24} />{t('reading.chapter_check')}</button>
           <p className="text-sm font-bold text-slate-500 text-center">{todayStr}{t('reading.today_stats', { count: todayLogCount })}</p>
        </div>
      </div>

      {/* Overlays */}
      {showSearch && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSearch(false)} />
          <div className="relative w-full max-w-md h-full md:h-[90vh] bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
             <div className="p-6 border-b flex items-center justify-between"><h3 className="font-black text-xl">말씀 검색</h3><button onClick={() => setShowSearch(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button></div>
             <div className="flex-1 overflow-hidden"><BibleSearch activeVersion={primaryVersion} onSelectResult={(bookId, chap, vers) => { setSelectedBook(bookId); setSelectedChapter(chap); setShowSearch(false); setTimeout(() => { const element = document.getElementById(`verse-${vers}`); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' }); setSelectedVerse(vers); }, 500); }} /></div>
          </div>
        </div>
      )}

      {showCommentary && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[500px] bg-white border-l shadow-2xl z-[150] animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full uppercase">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50"><div><h3 className="font-black text-lg">성경 주석</h3><p className="text-[10px] font-bold text-slate-400 mt-1">{currentBook?.name} {selectedChapter}장</p></div><button onClick={() => setShowCommentary(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button></div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {isCommentaryLoading ? <div className="flex flex-col items-center justify-center h-64 text-slate-300 gap-4"><Loader2 className="animate-spin" size={24} /><p className="text-xs font-bold">주석 로딩 중...</p></div> : commentaryData ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2"><div className="h-px flex-1 bg-slate-100"></div><span className="text-indigo-600 font-black text-[10px] tracking-[0.2em]">CHOKMAH</span><div className="h-px flex-1 bg-slate-100"></div></div>
                  <div className="space-y-8">{commentaryData.commentary?.map((item: any, idx: number) => ( <div key={idx} className="space-y-3">{item.verses && <span className="inline-block px-2 py-0.5 bg-indigo-50 text-[10px] font-black rounded text-indigo-500">VERSES {item.verses}</span>}<div className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-line prose prose-slate" dangerouslySetInnerHTML={{ __html: item.content }} /></div> ))}</div>
                </div>
              ) : <p className="text-center py-20 text-slate-400 italic">주석 정보가 없습니다.</p>}
            </div>
          </div>
        </div>
      )}

      <BibleSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} fontSize={fontSize} setFontSize={setFontSize} theme={theme} setTheme={setTheme} lineHeight={lineHeight} setLineHeight={setLineHeight} fontFamily={fontFamily} setFontFamily={setFontFamily} />
      <VersionSelector isOpen={isVersionSelectorOpen} onClose={() => setIsVersionSelectorOpen(false)} primaryVersion={primaryVersion} parallelVersion={parallelVersion} onSelectPrimary={(id) => setPrimaryVersion(id)} onSelectParallel={(id) => setParallelVersion(id)} />
      <ReadingProgress isOpen={isProgressOpen} onClose={() => setIsProgressOpen(false)} onNavigate={(b, c) => { setSelectedBook(b); setSelectedChapter(c); setIsProgressOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      <UserDashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} onNavigate={(b, c, v) => { setSelectedBook(b); setSelectedChapter(c); setIsDashboardOpen(false); setTimeout(() => { const element = document.getElementById(`verse-${v}`); if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); setSelectedVerse(v); } }, 800); }} />
      {selectedVerse && <NoteEditor isOpen={isNoteEditorOpen} onClose={() => setIsNoteEditorOpen(false)} bookId={selectedBook} bookName={currentBook?.name || ''} chapter={selectedChapter} verse={selectedVerse} verseText={currentVerses(primaryVersion).find(verse => verse.v === selectedVerse)?.t || ''} />}
      <BibleSelector isOpen={isSelectorOpen} onClose={() => setIsSelectorOpen(false)} currentBook={selectedBook} currentChapter={selectedChapter} maxVerse={currentVerses(primaryVersion).length} onSelect={(bookId, chap, vers) => { setSelectedBook(bookId); setSelectedChapter(chap); setIsSelectorOpen(false); setTimeout(() => { const element = document.getElementById(`verse-${vers}`); if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); setSelectedVerse(vers); } }, 800); }} />
    </div>
  );
}
