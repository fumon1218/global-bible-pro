import React from 'react';
import { X, Check, Headphones, Globe } from 'lucide-react';
import { BIBLE_VERSIONS } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface VersionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  primaryVersion: string;
  parallelVersion: string | null;
  onSelectPrimary: (id: string) => void;
  onSelectParallel: (id: string | null) => void;
}

export default function VersionSelector({
  isOpen,
  onClose,
  primaryVersion,
  parallelVersion,
  onSelectPrimary,
  onSelectParallel
}: VersionSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white md:rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Modern Header */}
        <div className="px-10 py-8 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Globe size={150} />
           </div>
           <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight">글로벌 역본 비교</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">Multi-Version Comparison</p>
           </div>
           <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 relative z-10">
             <X size={24} />
           </button>
        </div>

        {/* Translation Selection Info */}
        <div className="px-10 py-4 bg-indigo-50 border-b flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[11px] text-indigo-700 font-black uppercase tracking-widest">Parallel Mode Active</p>
           </div>
           <p className="text-[10px] text-indigo-400 font-bold italic">두 가지 말씀을 동시에 비교하며 읽을 수 있습니다.</p>
        </div>

        {/* Content - Two Premium Columns */}
        <div className="flex h-[450px] bg-white">
          {/* Left Column - Main Version */}
          <div className="flex-1 border-r border-slate-50 overflow-y-auto no-scrollbar py-4 px-6 scale-in-95">
            <p className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Main Version</p>
            <div className="space-y-1">
              {BIBLE_VERSIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => onSelectPrimary(v.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all group",
                    primaryVersion === v.id 
                      ? "bg-slate-900 text-white shadow-xl translate-x-2" 
                      : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                       "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                       primaryVersion === v.id ? "bg-white/10" : "bg-slate-100 group-hover:bg-white"
                    )}>
                       <Headphones size={18} className={primaryVersion === v.id ? "text-indigo-400" : "text-slate-400"} />
                    </div>
                    <span className="text-sm font-black tracking-tight">
                      {v.name}
                    </span>
                  </div>
                  {primaryVersion === v.id && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Secondary Version */}
          <div className="flex-1 bg-slate-50/50 overflow-y-auto no-scrollbar py-4 px-6">
            <p className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Parallel Version</p>
            <div className="space-y-1">
              <button
                onClick={() => onSelectParallel(null)}
                className={cn(
                   "w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all group",
                   parallelVersion === null 
                    ? "bg-indigo-600 text-white shadow-xl -translate-x-2" 
                    : "hover:bg-white text-slate-500 border border-transparent hover:border-slate-100"
                )}
              >
                <span className="text-sm font-black tracking-tight">대역없음 (Single View)</span>
                {parallelVersion === null && <Check size={18} strokeWidth={4} />}
              </button>

              {BIBLE_VERSIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => onSelectParallel(v.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all group",
                    parallelVersion === v.id 
                      ? "bg-indigo-600 text-white shadow-xl -translate-x-2" 
                      : "hover:bg-white text-slate-400 border border-transparent hover:border-slate-100"
                  )}
                >
                  <span className="text-sm font-black tracking-tight">
                    {v.name}
                  </span>
                  {parallelVersion === v.id && <Check size={18} strokeWidth={4} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 bg-white flex items-center justify-between">
           <div className="flex -space-x-4">
              {[1,2,3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-indigo-500/10" />
                 </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                 +6
              </div>
           </div>
          <button className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm shadow-2xl hover:bg-black transition-all active:scale-95">
             변화 적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
