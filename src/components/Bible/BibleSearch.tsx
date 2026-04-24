import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { BOOKS, BIBLE_VERSIONS } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

interface BibleSearchProps {
  onSelectResult: (bookId: string, chapter: number, verse: number) => void;
  activeVersion: string;
}

export default function BibleSearch({ onSelectResult, activeVersion }: BibleSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bibleData, setBibleData] = useState<any>(null);

  // Load current version data for searching
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/bible/${activeVersion.toLowerCase()}.json`);
        if (response.ok) {
          setBibleData(await response.json());
        }
      } catch (e) {
        console.error("Failed to load search data", e);
      }
    };
    loadData();
  }, [activeVersion]);

  const handleSearch = () => {
    if (!query.trim() || !bibleData) return;
    
    setIsSearching(true);
    setResults([]);

    setTimeout(() => {
      const searchResults: SearchResult[] = [];
      const term = query.toLowerCase();

      // Search Reference (e.g. "GEN 1:1" or "창 1:1")
      // Simple Reference logic
      const refMatch = query.match(/^(.+?)\s*(\d+)[:\s]*(\d*)$/);
      if (refMatch) {
        const bookTerm = refMatch[1].toLowerCase();
        const chap = parseInt(refMatch[2]);
        const vers = parseInt(refMatch[3]);

        const book = BOOKS.find(b => 
          b.name.toLowerCase().includes(bookTerm) || 
          b.id.toLowerCase() === bookTerm ||
          b.enName.toLowerCase().includes(bookTerm)
        );

        if (book && bibleData.book[book.jsonId]) {
          const chapter = bibleData.book[book.jsonId].chapter[chap.toString()];
          if (chapter) {
            if (vers && chapter.verse[vers.toString()]) {
              searchResults.push({
                bookId: book.id,
                bookName: book.name,
                chapter: chap,
                verse: vers,
                text: chapter.verse[vers.toString()].text,
                version: activeVersion
              });
            } else if (!vers) {
              // Add first few verses of chapter
              Object.entries(chapter.verse).slice(0, 5).forEach(([vNum, vData]: [string, any]) => {
                searchResults.push({
                  bookId: book.id,
                  bookName: book.name,
                  chapter: chap,
                  verse: parseInt(vNum),
                  text: vData.text,
                  version: activeVersion
                });
              });
            }
          }
        }
      }

      // Keyword Search (if no reference match or in addition)
      if (searchResults.length < 50) {
        for (const bookId in bibleData.book) {
          const book = bibleData.book[bookId];
          const bookInfo = BOOKS.find(b => b.jsonId === bookId);
          if (!bookInfo) continue;

          for (const chapNum in book.chapter) {
            const chapter = book.chapter[chapNum];
            for (const verseNum in chapter.verse) {
              const verse = chapter.verse[verseNum];
              if (verse.text.toLowerCase().includes(term)) {
                searchResults.push({
                  bookId: bookInfo.id,
                  bookName: bookInfo.name,
                  chapter: parseInt(chapNum),
                  verse: parseInt(verseNum),
                  text: verse.text,
                  version: activeVersion
                });
                if (searchResults.length >= 50) break;
              }
            }
            if (searchResults.length >= 50) break;
          }
          if (searchResults.length >= 50) break;
        }
      }

      setResults(searchResults);
      setIsSearching(false);
    }, 100);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="장절 검색 (예: 창 1:1) 또는 키워드..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 ring-[var(--color-secondary)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-medium">검색 중...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y">
            {results.map((res, i) => (
              <button 
                key={i}
                onClick={() => onSelectResult(res.bookId, res.chapter, res.verse)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider">
                    {res.bookName} {res.chapter}:{res.verse}
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <p 
                  className="text-sm text-gray-600 line-clamp-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: res.text }}
                />
              </button>
            ))}
          </div>
        ) : query && !isSearching ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Search size={24} className="text-gray-300" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500">성경 검색</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                성경 인물, 장소, 주제를 검색하거나<br/>
                '창 1:1'과 같이 바로가기를 입력하세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
