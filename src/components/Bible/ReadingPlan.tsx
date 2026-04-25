import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Circle, Trophy, ListChecks, ChevronRight, Loader2, Trash2 } from 'lucide-react';
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
];

export default function ReadingPlan({ isOpen, onClose, onNavigate }: ReadingPlanProps) {
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    return JSON.parse(localStorage.getItem('gbp_reading_progress') || '{}');
  });

  const [customReadings, setCustomReadings] = useState<{b: string, c: number}[]>(() => {
    return JSON.parse(localStorage.getItem('gbp_custom_readings') || '[]');
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState('GEN');
  const [newChap, setNewChap] = useState(1);

  const toggleProgress = (key: string) => {
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem('gbp_reading_progress', JSON.stringify(newProgress));
  };

  const addCustomReading = () => {
    const newReadings = [...customReadings, { b: newBook, c: newChap }];
    setCustomReadings(newReadings);
    localStorage.setItem('gbp_custom_readings', JSON.stringify(newReadings));
    setShowAdd(false);
  };

  const removeCustomReading = (idx: number) => {
    const newReadings = customReadings.filter((_, i) => i !== idx);
    setCustomReadings(newReadings);
    localStorage.setItem('gbp_custom_readings', JSON.stringify(newReadings));
  };

  const totalPossible = DEFAULT_PLAN.reduce((acc, curr) => acc + curr.readings.length, 0) + customReadings.length;
  const completedCount = Object.values(progress).filter(Boolean).length;
  const percentage = Math.round((completedCount / totalPossible) * 100) || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full md:h-[80vh] bg-white md:rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
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
            <h2 className="text-2xl font-black premium-heading mb-2">통독 매니저</h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {/* Custom readings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">나의 자유 통독</span>
              <button 
                onClick={() => setShowAdd(!showAdd)}
                className="text-xs font-bold text-[var(--color-secondary)] bg-white px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1"
              >
                {showAdd ? '닫기' : '+ 직접 추가'}
              </button>
            </div>

            {showAdd && (
              <div className="p-6 bg-white rounded-3xl border-2 border-dashed border-[var(--color-secondary)]/30 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <select 
                    value={newBook}
                    onChange={(e) => setNewBook(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-[var(--color-secondary)]/20"
                  >
                    {BOOKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <input 
                    type="number"
                    min="1"
                    max={BOOKS.find(b => b.id === newBook)?.chapters || 150}
                    value={newChap}
                    onChange={(e) => setNewChap(parseInt(e.target.value) || 1)}
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-[var(--color-secondary)]/20"
                    placeholder="장"
                  />
                </div>
                <button 
                  onClick={addCustomReading}
                  className="w-full py-3 bg-[var(--color-secondary)] text-white rounded-xl font-black text-sm shadow-lg shadow-[var(--color-secondary)]/20 active:scale-95 transition-all"
                >
                  통독 리스트에 추가
                </button>
              </div>
            )}

            <div className="space-y-3">
              {customReadings.map((reading, idx) => {
                const book = BOOKS.find(b => b.id === reading.b);
                const key = `custom_${idx}_${reading.b}_${reading.c}`;
                const isDone = progress[key];
                
                return (
                  <div key={key} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                    isDone ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100 hover:border-blue-400 shadow-sm"
                  )}>
                    <div className="flex items-center gap-4 flex-1" onClick={() => onNavigate(reading.b, reading.c)}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black", isDone ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-500")}>
                        {reading.c}
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm", isDone ? "text-gray-400" : "text-gray-900")}>{book?.name} {reading.c}장</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Self Reading</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => removeCustomReading(idx)} className="p-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 size={16} />
                       </button>
                       <button onClick={() => toggleProgress(key)} className={cn("p-2 transition-all", isDone ? "text-green-500" : "text-gray-200 hover:text-gray-400")}>
                        {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Daily plan */}
          <div className="space-y-4 opacity-60">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">기본 제공 계획표</span>
            <div className="space-y-4">
              {DEFAULT_PLAN.map((day) => (
                <div key={day.day} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Day {day.day}</span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  
                  <div className="space-y-3">
                    {day.readings.map((reading, idx) => {
                      const book = BOOKS.find(b => b.id === reading.b);
                      const key = `d${day.day}_r${idx}`;
                      const isDone = progress[key];
                      
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
                              toggleProgress(key);
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
          </div>
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
