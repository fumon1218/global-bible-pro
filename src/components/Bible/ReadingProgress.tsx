import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, Info, Award, Calendar } from 'lucide-react';
import { BOOKS } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface ReadingProgressProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (bookId: string, chapter: number) => void;
}

export default function ReadingProgress({ isOpen, onClose, onNavigate }: ReadingProgressProps) {
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});
  const [readingLogs, setReadingLogs] = useState<Record<string, number>>({});
  const [lastRead, setLastRead] = useState({ b: 'GEN', c: 1 });
  const [goalDates, setGoalDates] = useState(() => {
    const saved = localStorage.getItem('gbp_goal_dates');
    return saved ? JSON.parse(saved) : {
      start: '2026-01-01',
      end: '2026-12-31',
      target: 1 // 1독
    };
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Sync data on mount and whenever it opens
  useEffect(() => {
    if (!isOpen) return;
    
    const loadData = () => {
      const completed = JSON.parse(localStorage.getItem('gbp_completed_chapters') || '{}');
      const logs = JSON.parse(localStorage.getItem('gbp_reading_logs') || '{}');
      const last = JSON.parse(localStorage.getItem('gbp_last_ref') || '{"b": "GEN", "c": 1}');
      
      setCompletedChapters(completed);
      setReadingLogs(logs);
      setLastRead(last);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [isOpen]);

  // Calculate stats based on goals
  const totalChapters = BOOKS.reduce((acc, b) => acc + b.chapters, 0);
  const completedCount = Object.keys(completedChapters).length;
  const progressPercent = (completedCount / (totalChapters * goalDates.target)) * 100;
  
  // Daily target calculation
  const getDailyTarget = () => {
    const end = new Date(goalDates.end);
    const start = new Date(); // From today
    if (start > end) return 0;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const remainingChapters = (totalChapters * goalDates.target) - completedCount;
    return (remainingChapters / diffDays).toFixed(1);
  };

  const dailyTarget = getDailyTarget();

  const last7Days = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 7 ? '오늘' : (i === 6 ? '어제' : `${d.getMonth() + 1}/${d.getDate()}`);
    return {
      date: dateStr,
      label: dayName,
      count: readingLogs[dateStr] || 0
    };
  });

  const totalReadLast7Days = last7Days.reduce((acc, curr) => acc + curr.count, 0);

  const toggleChapter = (bookId: string, chapter: number) => {
    const key = `${bookId}_${chapter}`;
    const newCompleted = { ...completedChapters };
    const newLogs = { ...readingLogs };
    const today = new Date().toISOString().split('T')[0];
    
    if (newCompleted[key]) {
      delete newCompleted[key];
      newLogs[today] = Math.max(0, (newLogs[today] || 0) - 1);
    } else {
      newCompleted[key] = true;
      newLogs[today] = (newLogs[today] || 0) + 1;
    }
    
    setCompletedChapters(newCompleted);
    setReadingLogs(newLogs);
    localStorage.setItem('gbp_completed_chapters', JSON.stringify(newCompleted));
    localStorage.setItem('gbp_reading_logs', JSON.stringify(newLogs));
  };

  const handleReset = () => {
    if (!confirm('정말 모든 읽기 기록을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) return;
    localStorage.removeItem('gbp_completed_chapters');
    localStorage.removeItem('gbp_reading_logs');
    setCompletedChapters({});
    setReadingLogs({});
  };

  const saveGoal = (newGoal: any) => {
    setGoalDates(newGoal);
    localStorage.setItem('gbp_goal_dates', JSON.stringify(newGoal));
    setIsEditingGoal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full md:h-[95vh] bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-[10]">
          <div>
             <h2 className="text-xl font-black tracking-tight">글로벌 성경 통독 여정</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-0.5">Global Bible Journey</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all border border-red-500/10 text-xs font-bold"
              title="초기화"
            >
              Reset
            </button>
            <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Top Info Banner - Modern Minimal */}
          <div className="bg-indigo-600 text-white px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar size={14} />
               </div>
               <p className="text-xs font-bold">
                 <span className="opacity-70 font-medium">최근 읽음: </span>
                 {BOOKS.find(b => b.id === lastRead.b)?.name} {lastRead.c}장
               </p>
            </div>
            <p className="text-[10px] bg-black/20 px-3 py-1 rounded-full font-black">일일 목표 {dailyTarget}장</p>
          </div>

          {/* Stats Section (Deep Indigo/Slate Gradient Card) */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Weekly Report</p>
                    <h3 className="text-3xl font-black">7일간 <span className="text-indigo-400">{totalReadLast7Days}장</span> 통독</h3>
                  </div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <Award size={20} className="text-indigo-300" />
                  </div>
               </div>

               <div className="flex items-end justify-between gap-2 h-28 mb-4 relative z-10">
                  {last7Days.map((day, i) => {
                    const max = Math.max(...last7Days.map(d => d.count), 5);
                    const height = (day.count / max) * 100;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full group/bar">
                           {day.count > 0 && (
                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black p-1 bg-white text-black rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                               {day.count}
                             </span>
                           )}
                           <div 
                             className={cn(
                               "w-full rounded-2xl transition-all duration-1000 ease-out shadow-lg",
                               i === 7 ? "bg-indigo-400 shadow-indigo-500/20" : "bg-white/20 hover:bg-white/40"
                             )} 
                             style={{ height: `${Math.max(height, 4)}%` }} 
                           />
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-tighter",
                          i === 7 ? "text-white" : "text-white/40"
                        )}>{day.label}</span>
                      </div>
                    );
                  })}
               </div>

               <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 relative z-10">
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Done</span>
                        <span className="text-sm font-black">{completedCount}장</span>
                     </div>
                     <div className="w-px h-6 bg-white/10" />
                     <div className="flex flex-col">
                        <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Left</span>
                        <span className="text-sm font-black">{(totalChapters * goalDates.target) - completedCount}장</span>
                     </div>
                  </div>
                  <button className="px-5 py-2.5 bg-white text-indigo-900 rounded-2xl text-xs font-black shadow-xl hover:scale-105 transition-all">
                     상세 분석
                  </button>
               </div>
            </div>
          </div>

          <div className="px-6 py-2 grid grid-cols-2 gap-4">
             <button 
                onClick={() => onNavigate(lastRead.b, lastRead.c)}
                className="bg-slate-900 text-white rounded-[2rem] p-6 flex flex-col items-start gap-4 shadow-xl hover:bg-black transition-all group overflow-hidden relative text-left"
              >
                <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-125 transition-transform">
                   <ChevronRight size={100} />
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                   <ChevronRight size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Continue Journey</p>
                  <p className="font-black text-sm">{BOOKS.find(b => b.id === lastRead.b)?.name} {lastRead.c}장</p>
                </div>
             </button>
             <button className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col items-start gap-4 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative text-left">
                <div className="absolute -bottom-4 -right-4 text-slate-50 group-hover:scale-125 transition-transform">
                   <Award size={100} />
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                   <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">My Status</p>
                  <p className="font-black text-sm text-slate-800">통독 완수 현황</p>
                </div>
             </button>
          </div>

          <div className="px-6 py-4">
             <p className="text-center text-xs text-slate-500">
               앞으로 매일 <span className="text-indigo-600 font-black">{dailyTarget}개 장</span>씩 읽으시면 됩니다. 
               <button 
                 onClick={() => setIsEditingGoal(true)}
                 className="ml-2 text-[10px] text-indigo-400 font-black hover:underline"
               >
                 [목표 기간 수정]
               </button>
             </p>
          </div>

          <div className="px-6 pb-20 space-y-8 mt-8">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1 h-6 bg-indigo-600 rounded-full" />
               <h4 className="text-lg font-black text-slate-800">성경별 통독 현황</h4>
            </div>
            
            {BOOKS.map(book => (
              <div key={book.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-slate-900">{book.name}</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{book.enName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-1000" 
                         style={{ width: `${(Object.keys(completedChapters).filter(k => k.startsWith(book.id)).length / book.chapters) * 100}%` }}
                       />
                    </div>
                    <span className="text-[10px] font-black text-slate-400">
                      {Object.keys(completedChapters).filter(k => k.startsWith(book.id)).length} / {book.chapters}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: book.chapters }).map((_, i) => {
                    const ch = i + 1;
                    const isDone = completedChapters[`${book.id}_${ch}`];
                    return (
                      <button
                        key={ch}
                        onClick={() => toggleChapter(book.id, ch)}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center text-[11px] font-black transition-all relative",
                          isDone 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-95" 
                            : "bg-white border border-slate-100 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
                        )}
                      >
                        {ch}
                        {isDone && (
                           <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                              <Check size={8} className="text-white" strokeWidth={4} />
                           </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl text-white p-6 pb-10 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-700">
             <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Target Period</span>
                   <span className="text-[11px] font-bold">{goalDates.start.replace(/-/g, '.')} ~ {goalDates.end.replace(/-/g, '.')}</span>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total Completion</div>
                   <div className="text-xl font-black text-indigo-400">{progressPercent.toFixed(1)}%</div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-black">
                      <span className="opacity-40">CHAPTERS</span>
                      <span>{completedCount} / {totalChapters * goalDates.target}</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-black">
                      <span className="opacity-40">VERSES (EST)</span>
                      <span>{(progressPercent * 0.9).toFixed(1)}%</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600 transition-all duration-1000" style={{ width: `${progressPercent * 0.9}%` }} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {isEditingGoal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingGoal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6">통독 목표 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">시작일</label>
                <input 
                  type="date" 
                  defaultValue={goalDates.start}
                  onChange={(e) => setGoalDates({...goalDates, start: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">종료일</label>
                <input 
                  type="date" 
                  defaultValue={goalDates.end}
                  onChange={(e) => setGoalDates({...goalDates, end: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">목표 (횟수)</label>
                <select 
                  defaultValue={goalDates.target}
                  onChange={(e) => setGoalDates({...goalDates, target: parseInt(e.target.value)})}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
                >
                  <option value={1}>1독 (1,189장)</option>
                  <option value={2}>2독 (2,378장)</option>
                  <option value={3}>3독 (3,567장)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
               <button onClick={() => setIsEditingGoal(false)} className="py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm">취소</button>
               <button onClick={() => saveGoal(goalDates)} className="py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-indigo-200 shadow-lg">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
