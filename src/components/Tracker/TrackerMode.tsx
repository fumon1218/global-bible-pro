import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Share2, Settings, Download, Users, CheckCircle2, Trophy, Calendar, Target } from 'lucide-react';
import html2canvas from 'html2canvas';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { BOOKS } from '../../data/mockData';
import { TOTAL_CHAPTERS } from '../../data/trackerData';
import { FamilyMember, ReadStatus } from '../../types/tracker';
import { cn } from '../../lib/utils';

const COLOR_THEMES = [
  { id: 'red', dotColor: 'bg-red-500', color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'yellow', dotColor: 'bg-yellow-400', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { id: 'green', dotColor: 'bg-green-500', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'pink', dotColor: 'bg-pink-400', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'blue', dotColor: 'bg-blue-500', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'indigo', dotColor: 'bg-indigo-500', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'orange', dotColor: 'bg-orange-500', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'teal', dotColor: 'bg-teal-500', color: 'bg-teal-50 border-teal-200 text-teal-700' },
];

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: 'member1', name: '아빠', color: 'bg-blue-50 border-blue-200 text-blue-700', dotColor: 'bg-blue-500', label: '아빠' },
  { id: 'member2', name: '엄마', color: 'bg-pink-50 border-pink-200 text-pink-700', dotColor: 'bg-pink-400', label: '엄마' },
];

export default function TrackerMode() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [readStatus, setReadStatus] = useState<ReadStatus>({});
  const readStatusRef = useRef<ReadStatus>({});
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  const [activeMemberId, setActiveMemberId] = useState<string>('member1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastClicked, setLastClicked] = useState<{ bookName: string; index: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    readStatusRef.current = readStatus;
  }, [readStatus]);

  // Sync with Firestore
  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "bible_tracker", "config"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.members) setFamilyMembers(data.members);
        if (data.startDate) setStartDate(data.startDate);
        if (data.endDate) setEndDate(data.endDate);
      }
      setIsLoading(false);
    });

    const unsubStatus = onSnapshot(doc(db, "bible_tracker", "status"), (snapshot) => {
      if (snapshot.exists()) {
        setReadStatus(snapshot.data() as ReadStatus);
      }
    });

    return () => {
      unsubConfig();
      unsubStatus();
    };
  }, []);

  const familyProgress = useMemo(() => {
    const results: Record<string, number> = {};
    familyMembers.forEach(m => { results[m.id] = 0; });

    BOOKS.forEach(book => {
      const chapters = readStatus[book.name];
      if (chapters) {
        Object.values(chapters).forEach(readers => {
          if (Array.isArray(readers)) {
            readers.forEach(rid => {
              if (results[rid] !== undefined) results[rid]++;
            });
          }
        });
      }
    });
    return results;
  }, [readStatus, familyMembers]);

  const activeProgress = useMemo(() => {
    const readCount = familyProgress[activeMemberId] || 0;
    return {
      total: TOTAL_CHAPTERS,
      current: readCount,
      percentage: (readCount / TOTAL_CHAPTERS) * 100
    };
  }, [familyProgress, activeMemberId]);

  const goalStats = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (totalDays <= 0) return null;

    const chaptersLeft = TOTAL_CHAPTERS - activeProgress.current;
    const dailyTarget = daysRemaining > 0 ? (chaptersLeft / daysRemaining).toFixed(1) : "0";

    return { daysRemaining, dailyTarget };
  }, [startDate, endDate, activeProgress]);

  const toggleChapter = useCallback(async (bookName: string, chapterIdx: number, isShift: boolean) => {
    if (!activeMemberId) return;

    const currentStatus = readStatusRef.current;
    const bookData = { ...(currentStatus[bookName] || {}) };

    let targetIndices = [chapterIdx];
    if (isShift && lastClicked && lastClicked.bookName === bookName) {
      const start = Math.min(lastClicked.index, chapterIdx);
      const end = Math.max(lastClicked.index, chapterIdx);
      targetIndices = [];
      for (let i = start; i <= end; i++) targetIndices.push(i);
    }

    const firstChapterReaders = bookData[chapterIdx] || [];
    const shouldAdd = !firstChapterReaders.includes(activeMemberId);

    targetIndices.forEach(idx => {
      const readers = [...(bookData[idx] || [])];
      const mIdx = readers.indexOf(activeMemberId);
      if (shouldAdd) {
        if (mIdx === -1) readers.push(activeMemberId);
      } else {
        if (mIdx > -1) readers.splice(mIdx, 1);
      }
      bookData[idx] = readers;
    });

    setReadStatus(prev => ({ ...prev, [bookName]: bookData }));
    setLastClicked({ bookName, index: chapterIdx });

    await setDoc(doc(db, "bible_tracker", "status"), {
      [bookName]: bookData
    }, { merge: true });
  }, [activeMemberId, lastClicked]);

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { scale: 2, backgroundColor: '#fdfcf8' });
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = '성경읽기표.png';
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--color-secondary)] font-bold">읽기표를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold premium-heading tracking-tight">가족 성경 읽기표</h2>
          <p className="text-gray-400">함께 말씀을 읽으며 은혜를 나누는 시간입니다.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-sm font-medium"
          >
            <Settings size={18} /> 설정
          </button>
          <button 
            onClick={handleExportImage}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm font-medium"
          >
            <Download size={18} /> 이미지 저장
          </button>
        </div>
      </header>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-8 space-y-6">
          <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Users size={16} /> 참여 구성원
          </div>
          <div className="flex flex-wrap gap-3">
            {familyMembers.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMemberId(m.id)}
                className={cn(
                  "px-4 py-2 rounded-2xl text-sm font-bold transition-all border-2",
                  activeMemberId === m.id 
                    ? "bg-white border-[var(--color-secondary)] text-[var(--color-primary)] shadow-md"
                    : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", m.dotColor)} />
                  {m.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card-premium p-8 space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Trophy size={16} /> 개인 진도율
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold premium-heading">{activeProgress.percentage.toFixed(1)}%</span>
              <span className="text-xs text-gray-400 font-bold">{activeProgress.current} / {activeProgress.total} 장</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-secondary)] transition-all duration-1000"
                style={{ width: `${activeProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card-premium p-8 space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Target size={16} /> 읽기 목표
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-bold uppercase">남은 기간</div>
              <div className="text-xl font-bold">{goalStats?.daysRemaining}일</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-bold uppercase">하루 목표</div>
              <div className="text-xl font-bold">{goalStats?.dailyTarget}장</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bible Grid */}
      <div ref={exportRef} className="space-y-12">
        {['OT', 'NT'].map(cat => (
          <section key={cat} className="space-y-8">
            <h3 className="text-2xl font-bold premium-heading border-b-2 border-gray-100 pb-2 inline-block">
              {cat === 'OT' ? '구약 성경' : '신약 성경'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BOOKS.filter(b => b.category === cat).map(book => (
                <div key={book.id} className="card-premium overflow-hidden border-0 bg-white/50">
                  <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-slate-800">{book.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{book.chapters} CHAPS</p>
                    </div>
                    <div className="text-xs font-bold text-[var(--color-secondary)]">
                      {Math.round(((Object.values(readStatus[book.name] || {}).filter(readers => readers.includes(activeMemberId)).length) / book.chapters) * 100)}%
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-6 gap-2">
                    {Array.from({ length: book.chapters }).map((_, idx) => {
                      const readers = (readStatus[book.name] || {})[idx] || [];
                      const isRead = readers.includes(activeMemberId);
                      return (
                        <button
                          key={idx}
                          onClick={(e) => toggleChapter(book.name, idx, e.shiftKey)}
                          className={cn(
                            "aspect-square rounded-xl text-[10px] font-bold transition-all relative flex items-center justify-center",
                            isRead 
                              ? "bg-[var(--color-secondary)] text-white shadow-sm scale-105" 
                              : "bg-white border border-gray-100 text-gray-300 hover:border-[var(--color-secondary)]"
                          )}
                        >
                          <span className="relative z-10">{idx + 1}</span>
                          <div className="absolute bottom-1 flex gap-0.5 px-0.5 justify-center w-full">
                            {familyMembers.map(m => readers.includes(m.id) && (
                              <div key={m.id} className={cn("w-1 h-1 rounded-full border-[0.2px] border-white", m.dotColor)} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {isSettingsOpen && (
        <SettingsCard 
          members={familyMembers}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setIsSettingsOpen(false)}
          onSave={async (m: FamilyMember[], s: string, e: string) => {
             await setDoc(doc(db, "bible_tracker", "config"), { 
               members: m,
               startDate: s,
               endDate: e
             }, { merge: true });
             setIsSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SettingsCard({ members, startDate, endDate, onClose, onSave }: any) {
  const [m, setM] = useState(members);
  const [s, setS] = useState(startDate);
  const [e, setE] = useState(endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h3 className="text-2xl font-bold premium-heading">설정</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400">닫기</button>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">시작일</label>
              <input type="date" value={s} onChange={ev => setS(ev.target.value)} className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 ring-[var(--color-secondary)]/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">목표일</label>
              <input type="date" value={e} onChange={ev => setE(ev.target.value)} className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 ring-[var(--color-secondary)]/20" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase">구성원 관리</label>
            <div className="space-y-3">
              {m.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                  <div className={cn("w-4 h-4 rounded-full", member.dotColor)} />
                  <input 
                    value={member.name} 
                    onChange={ev => {
                      const newM = [...m];
                      newM[idx].name = ev.target.value;
                      setM(newM);
                    }}
                    className="bg-transparent font-bold flex-1 focus:outline-none" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => onSave(m, s, e)}
          className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
