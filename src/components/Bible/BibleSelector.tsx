import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Search } from 'lucide-react';
import { BOOKS, BibleBook } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface BibleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bookId: string, chapter: number, verse: number) => void;
  currentBook: string;
  currentChapter: number;
  maxVerse?: number;
}

const CATEGORIES = {
  OT: [
    { title: '율법서', books: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'] },
    { title: '역사서', books: ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'] },
    { title: '시가서', books: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'] },
    { title: '대예언서', books: ['ISA', 'JER', 'LAM', 'EZK', 'DAN'] },
    { title: '소예언서', books: ['HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'] },
  ],
  NT: [
    { title: '복음서', books: ['MAT', 'MRK', 'LUK', 'JHN'] },
    { title: '역사서', books: ['ACT'] },
    { title: '바울서신', books: ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM'] },
    { title: '일반서신', books: ['HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'] },
    { title: '예언서', books: ['REV'] },
  ]
};

export default function BibleSelector({ isOpen, onClose, onSelect, currentBook, currentChapter, maxVerse = 80 }: BibleSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'OT' | 'NT'>(BOOKS.find(b => b.id === currentBook)?.category || 'OT');
  const [tempBook, setTempBook] = useState(currentBook);
  const [tempChapter, setTempChapter] = useState(currentChapter);
  const [tempVerse, setTempVerse] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const bookListRef = useRef<HTMLDivElement>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);

  const bookData = BOOKS.find(b => b.id === tempBook);
  const chapters = bookData?.chapters || 0;

  // Reset temp selection when opening
  useEffect(() => {
    if (isOpen) {
      setTempBook(currentBook);
      setTempChapter(currentChapter);
      setTempVerse(1);
      const cat = BOOKS.find(b => b.id === currentBook)?.category || 'OT';
      setSelectedTab(cat);
    }
  }, [isOpen, currentBook, currentChapter]);

  if (!isOpen) return null;

  const filteredCategories = (CATEGORIES[selectedTab] || []).map(cat => ({
    ...cat,
    books: cat.books.filter(id => {
      const b = BOOKS.find(book => book.id === id);
      if (!b) return false;
      const search = (searchTerm || '').toLowerCase();
      return b.name.includes(search) || b.enName.toLowerCase().includes(search);
    })
  })).filter(cat => cat.books.length > 0);

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-0 md:p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl h-full md:h-[90vh] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold premium-heading">성경 선택</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setSelectedTab('OT')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                  selectedTab === 'OT' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                구약
              </button>
              <button 
                onClick={() => setSelectedTab('NT')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                  selectedTab === 'NT' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                신약
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 bg-gray-50/50 border-b">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="성경 책 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 ring-gray-200 transition-all"
            />
          </div>
        </div>

        {/* Content - 3 Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Books */}
          <div ref={bookListRef} className="w-1/2 md:w-2/5 border-r overflow-y-auto bg-gray-50/30 scroll-smooth">
            {filteredCategories.map((cat, i) => (
              <div key={i} className="mb-4">
                <div className="px-4 py-2 bg-gray-100/50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 backdrop-blur z-[5]">
                  {cat.title}
                </div>
                <div className="p-1">
                  {cat.books.map(id => {
                    const b = BOOKS.find(book => book.id === id)!;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setTempBook(id);
                          setTempChapter(1);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                          tempBook === id 
                            ? "bg-white shadow-md ring-1 ring-gray-200" 
                            : "hover:bg-gray-100/50"
                        )}
                      >
                        <div className="text-left">
                          <p className={cn(
                            "font-bold text-sm",
                            tempBook === id ? "text-gray-900" : "text-gray-600"
                          )}>
                            {b.name}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{b.enName}</p>
                        </div>
                        {tempBook === id && <ChevronRight size={14} className="text-gray-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Chapters */}
          <div ref={chapterListRef} className="w-1/4 border-r overflow-y-auto bg-white scroll-smooth">
            <div className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-[5]">
              장 (CH)
            </div>
            <div className="grid grid-cols-1 p-2 gap-1">
              {Array.from({ length: chapters }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setTempChapter(i + 1)}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-sm transition-all",
                    tempChapter === i + 1 
                      ? "bg-gray-900 text-white shadow-lg" 
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  {i + 1}장
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Verses */}
          <div className="w-1/4 overflow-y-auto bg-white scroll-smooth">
            <div className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-[5]">
              절 (VS)
            </div>
            <div className="grid grid-cols-1 p-2 gap-1">
              {Array.from({ length: maxVerse }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => {
                    setTempVerse(i + 1);
                    onSelect(tempBook, tempChapter, i + 1);
                    onClose();
                  }}
                  className={cn(
                    "w-full py-2 rounded-lg font-bold text-sm transition-all",
                    tempVerse === i + 1 
                      ? "bg-[var(--color-secondary)] text-white shadow-md" 
                      : "text-gray-400 hover:bg-gray-50 border-b border-gray-100 last:border-0 rounded-none first:rounded-t-lg last:rounded-b-lg"
                  )}
                >
                  {i + 1}절
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center font-black text-xs text-[var(--color-secondary)]">
              {tempBook}
            </div>
            <div>
              <p className="font-bold text-gray-900">{bookData?.name} {tempChapter}장</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">{bookData?.enName} Chapter {tempChapter}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              onSelect(tempBook, tempChapter, 1);
              onClose();
            }}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all active:scale-95"
          >
            이동하기
          </button>
        </div>
      </div>
    </div>
  );
}
