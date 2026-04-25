import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Circle, Trophy, ListChecks, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BOOKS } from '../../data/mockData';

interface ReadingPlanProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (bookId: string, chapter: number) => void;
}

const DEFAULT_PLAN = [
  { day: 1, readings: [{ b: 'MAT', c: 1 }, { b: 'MAT', c: 2 }] },
  { day: 2, readings: [{ b: 'MAT', c: 3 }, { b: 'MAT', c: 4 }] },
  { day: 3, readings: [{ b: 'MAT', c: 5 }, { b: 'MAT', c: 6 }] },
  // ... Simplified for now
];

export default function ReadingPlan({ isOpen, onClose, onNavigate }: ReadingPlanProps) {
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    return JSON.parse(localStorage.getItem('gbp_reading_progress') || '{}');
  });

  const toggleProgress = (day: number, readingIdx: number) => {
    const key = `d${day}_r${readingIdx}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem('gbp_reading_progress', JSON.stringify(newProgress));
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalCount = DEFAULT_PLAN.reduce((acc, curr) => acc + curr.readings.length, 0);
  const percentage = Math.round((completedCount / totalCount) * 100) || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full md:h-[80vh] bg-white md:rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b relative overflow-hidden bg-gray-900 text-white md:rounded-t-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-secondary)]/20 blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="w-12 h-12 rounded-2xl bg-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)]">
                <Calendar size={24} />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <h2 className="text-2xl font-black premium-heading mb-2">오늘의 통독</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-secondary)] transition-all duration-1000" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[var(--color-secondary)]">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {DEFAULT_PLAN.map((day) => (
            <div key={day.day} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Day {day.day}</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              
              <div className="space-y-3">
                {day.readings.map((reading, idx) => {
                  const book = BOOKS.find(b => b.id === reading.b);
                  const isDone = progress[`d${day.day}_r${idx}`];
                  
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                        isDone ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100 hover:border-[var(--color-secondary)] shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1" onClick={() => onNavigate(reading.b, reading.c)}>
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isDone ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-400 group-hover:bg-[var(--color-secondary)] group-hover:text-white"
                        )}>
                          <span className="text-xs font-black">{reading.c}</span>
                        </div>
                        <div>
                          <p className={cn("font-bold text-sm", isDone ? "text-gray-400" : "text-gray-900")}>
                            {book?.name} {reading.c}장
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{book?.enName}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProgress(day.day, idx);
                        }}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          isDone ? "text-green-500 scale-110" : "text-gray-200 hover:text-gray-400"
                        )}
                      >
                        {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-xs font-bold text-gray-500">{completedCount}장 통독 완료!</span>
          </div>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Powered by Global Bible Pro</p>
        </div>
      </div>
    </div>
  );
}
